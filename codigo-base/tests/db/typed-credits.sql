-- The harness rolls back every fixture and assertion.
-- Ticket 04.7: typed credit origin, decimal write-protection, and a conservative
-- audited legacy opening. The decimal book gains an origin discriminator so base
-- credits stay unique per context while opening/adjustment/bonus rows coexist.
-- open_legacy_credit is an admin-only, audited opening that NEVER fabricates an
-- ordinal or a retroactive base credit; it only establishes an opening balance.

insert into auth.users (id,email,raw_user_meta_data) values
 ('42700000-0000-4000-a000-000000000001','typed-student@example.invalid','{"username":"typed-student"}'),
 ('42700000-0000-4000-a000-000000000002','typed-author@example.invalid','{"username":"typed-author"}'),
 ('42700000-0000-4000-a000-000000000003','typed-admin@example.invalid','{"username":"typed-admin","role":"admin"}');
-- Promote the admin fixture (role comes from metadata but set explicitly for clarity).
update public.profiles set role='admin' where id='42700000-0000-4000-a000-000000000003';

insert into public.courses (id,creator_id,title,slug,status,visibility) values
 ('42700000-0000-4000-a000-000000000010','42700000-0000-4000-a000-000000000002','Tipado','typed-42','published','public');
insert into public.modules (id,course_id,title) values
 ('42700000-0000-4000-a000-000000000011','42700000-0000-4000-a000-000000000010','Modulo');
insert into public.lessons (id,module_id,title,status) values
 ('42700000-0000-4000-a000-000000000012','42700000-0000-4000-a000-000000000011','Aula','published');
insert into public.questions (id,lesson_id,type,prompt,config,xp_value) values
 ('42700000-0000-4000-a000-000000000013','42700000-0000-4000-a000-000000000012','multiple_choice','Escolha A',
  '{"options":[{"id":"a","correct":true},{"id":"b","correct":false}]}',4);

-- 1. The finalizer still grants a BASE credit, now tagged origin='base'.
set local role authenticated;
set local request.jwt.claim.sub = '42700000-0000-4000-a000-000000000001';
set local request.jwt.claims = '{"sub":"42700000-0000-4000-a000-000000000001","role":"authenticated"}';
do $$ declare a public.attempts%rowtype; v_origin text; begin
  select * into a from public.start_attempt('42700000-0000-4000-a000-000000000012','42700000-0000-4000-a000-000000000010',null);
  perform 1 from public.save_attempt_answer(a.id,'42700000-0000-4000-a000-000000000013','{"selected":["a"]}');
  perform 1 from public.finalize_attempt(a.id);
  select origin into v_origin from public.learning_credits
   where user_id='42700000-0000-4000-a000-000000000001' and room_id is null
     and question_id='42700000-0000-4000-a000-000000000013';
  if v_origin is distinct from 'base' then
    raise exception 'Credito do finalizador nao foi marcado como origem base (%).', v_origin;
  end if;
end $$;

-- 2. A second BASE row in the same (user, question, context) is rejected by the
--    base-scoped unique index, but an 'opening' row in the same context coexists.
reset role;
do $$ begin
  begin
    insert into public.learning_credits (user_id,question_id,attempt_id,course_id,room_id,ordinal,base_xp,amount,origin)
     select user_id,question_id,attempt_id,course_id,room_id,ordinal,base_xp,amount,'base'
       from public.learning_credits
      where user_id='42700000-0000-4000-a000-000000000001' and room_id is null
        and question_id='42700000-0000-4000-a000-000000000013';
    raise exception 'Segunda base no mesmo contexto foi aceita';
  exception when unique_violation then null; end;
end $$;
-- An opening row for the same context must be allowed (different origin,
-- context-level: question_id/attempt_id null per the origin-shape CHECK).
insert into public.learning_credits (user_id,question_id,attempt_id,course_id,room_id,ordinal,base_xp,amount,origin)
 values ('42700000-0000-4000-a000-000000000001',null,null,
   '42700000-0000-4000-a000-000000000010',null,1,0,5.0000,'opening');
do $$ declare n integer; begin
  select count(*) into n from public.learning_credits
   where user_id='42700000-0000-4000-a000-000000000001' and room_id is null
     and course_id='42700000-0000-4000-a000-000000000010';
  if n <> 2 then
    raise exception 'Abertura e base nao coexistiram no mesmo contexto (% linhas).', n;
  end if;
end $$;
delete from public.learning_credits
 where user_id='42700000-0000-4000-a000-000000000001' and origin='opening';

-- 3. Decimal write-protection: an authenticated client cannot write the
--    server-owned decimal/legacy metric columns of room_members or profiles.
set local role authenticated;
set local request.jwt.claim.sub = '42700000-0000-4000-a000-000000000001';
set local request.jwt.claims = '{"sub":"42700000-0000-4000-a000-000000000001","role":"authenticated"}';
do $$ begin
  begin
    update public.profiles set xp_credits = xp_credits + 100 where id=auth.uid();
    raise exception 'Cliente escreveu xp_credits diretamente';
  exception when insufficient_privilege then null; end;
end $$;
reset role;
-- A room with the student as member, to probe room_members column protection.
insert into public.rooms (id,educator_id,course_id,name,access_code) values
 ('42700000-0000-4000-a000-000000000030','42700000-0000-4000-a000-000000000002',
  '42700000-0000-4000-a000-000000000010','Sala','TYP001');
insert into public.room_members (room_id,user_id,status) values
 ('42700000-0000-4000-a000-000000000030','42700000-0000-4000-a000-000000000001','active');
set local role authenticated;
set local request.jwt.claim.sub = '42700000-0000-4000-a000-000000000001';
set local request.jwt.claims = '{"sub":"42700000-0000-4000-a000-000000000001","role":"authenticated"}';
do $$ begin
  begin
    update public.room_members set credits_internal = credits_internal + 50
     where room_id='42700000-0000-4000-a000-000000000030' and user_id=auth.uid();
    raise exception 'Cliente escreveu credits_internal diretamente';
  exception when insufficient_privilege then null; end;
  begin
    update public.room_members set xp_internal = xp_internal + 50
     where room_id='42700000-0000-4000-a000-000000000030' and user_id=auth.uid();
    raise exception 'Cliente escreveu xp_internal inteiro diretamente';
  exception when insufficient_privilege then null; end;
end $$;

-- 3b. The educator can still manage membership columns (status/removed_at): the
--     column lockdown must not narrow legitimate membership management.
set local request.jwt.claim.sub = '42700000-0000-4000-a000-000000000002';
set local request.jwt.claims = '{"sub":"42700000-0000-4000-a000-000000000002","role":"authenticated"}';
do $$ begin
  update public.room_members set status='removed', removed_at=now()
   where room_id='42700000-0000-4000-a000-000000000030'
     and user_id='42700000-0000-4000-a000-000000000001';
  if not exists (select 1 from public.room_members
    where room_id='42700000-0000-4000-a000-000000000030'
      and user_id='42700000-0000-4000-a000-000000000001' and status='removed') then
    raise exception 'Educador perdeu a gestao de status do membro';
  end if;
  -- And the educator may still delete a membership row (FOR ALL policy intact).
  delete from public.room_members
   where room_id='42700000-0000-4000-a000-000000000030'
     and user_id='42700000-0000-4000-a000-000000000001';
  if exists (select 1 from public.room_members
    where room_id='42700000-0000-4000-a000-000000000030'
      and user_id='42700000-0000-4000-a000-000000000001') then
    raise exception 'Educador perdeu a exclusao de membro';
  end if;
end $$;
-- Restore the membership for later context probing.
reset role;
insert into public.room_members (room_id,user_id,status) values
 ('42700000-0000-4000-a000-000000000030','42700000-0000-4000-a000-000000000001','active');

-- 4. open_legacy_credit is admin-only: a non-admin caller is rejected (42501).
do $$ begin
  begin
    perform public.open_legacy_credit('42700000-0000-4000-a000-000000000001',
      '42700000-0000-4000-a000-000000000010',null,25.0000,'abertura ficticia');
    raise exception 'Nao-admin executou a abertura de legado';
  exception when insufficient_privilege then null; end;
end $$;

-- 5. open_legacy_credit as admin: records origin='opening', audited, adjusts the
--    decimal balance, is unique per context, and never makes the balance negative.
set local request.jwt.claim.sub = '42700000-0000-4000-a000-000000000003';
set local request.jwt.claims = '{"sub":"42700000-0000-4000-a000-000000000003","role":"authenticated"}';
do $$ declare saldo_antes numeric; saldo_depois numeric; begin
  -- Balance read via the privileged harness role (RLS would hide another user's row).
  select xp_credits into saldo_antes from public.profiles where id='42700000-0000-4000-a000-000000000001';
  perform public.open_legacy_credit('42700000-0000-4000-a000-000000000001',
    '42700000-0000-4000-a000-000000000010',null,25.0000,'abertura auditada do legado');
  select xp_credits into saldo_depois from public.profiles where id='42700000-0000-4000-a000-000000000001';
  if round(saldo_depois - saldo_antes,4) <> 25.0000 then
    raise exception 'Abertura nao ajustou o saldo decimal em 25,0000 (% -> %).', saldo_antes, saldo_depois;
  end if;
  -- Unique per context: a second opening for the same context is rejected.
  begin
    perform public.open_legacy_credit('42700000-0000-4000-a000-000000000001',
      '42700000-0000-4000-a000-000000000010',null,10.0000,'abertura duplicada');
    raise exception 'Segunda abertura no mesmo contexto foi aceita';
  exception when unique_violation then null; end;
  -- A negative opening that would drive the balance below zero is rejected
  -- specifically by the 0028 >= 0 CHECK (not some unrelated error).
  begin
    perform public.open_legacy_credit('42700000-0000-4000-a000-000000000001',
      '42700000-0000-4000-a000-000000000010',null,-100000.0000,'ajuste negativo invalido');
    raise exception 'Abertura tornou o saldo decimal negativo';
  exception when check_violation then null; end;
end $$;

-- The opening row exists and carries the audit note (read as the harness owner).
reset role;
do $$ declare n integer; v_note text; begin
  select count(*), max(note) into n, v_note from public.learning_credits
   where user_id='42700000-0000-4000-a000-000000000001' and course_id='42700000-0000-4000-a000-000000000010'
     and room_id is null and origin='opening';
  if n <> 1 then
    raise exception 'Abertura nao gravou exatamente uma linha opening (% linhas).', n;
  end if;
  if v_note is distinct from 'abertura auditada do legado' then
    raise exception 'Abertura nao preservou a nota de auditoria (%).', v_note;
  end if;
end $$;

-- 6. The opening did NOT fabricate an ordinal on any answer and did not create a
--    base credit: the only base row is still the one the finalizer wrote.
do $$ declare n_base integer; begin
  select count(*) into n_base from public.learning_credits
   where user_id='42700000-0000-4000-a000-000000000001' and origin='base';
  if n_base <> 1 then
    raise exception 'Abertura alterou o numero de creditos base (% base).', n_base;
  end if;
end $$;
