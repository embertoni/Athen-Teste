-- The harness rolls back every fixture and assertion.
-- Ticket 04.6: historical ordinal of the FIRST submission (per user / semantic
-- question / context) and the decimal credit book built on top of it. The
-- ordinal is assigned at first-submission time, serialized on the attempt lock;
-- legacy first submissions (first_submitted_at null) never receive a fabricated
-- ordinal (Q081-Q084). The decimal credit is base/ordinal rounded once to four
-- places, unique per (user, question, context), written only by the public
-- finalizer, leaving the legacy integer XP path byte-identical.

insert into auth.users (id,email,raw_user_meta_data) values
 ('42600000-0000-4000-a000-000000000001','ord-student@example.invalid','{"username":"ord-student"}'),
 ('42600000-0000-4000-a000-000000000002','ord-author@example.invalid','{"username":"ord-author"}');

-- Published public course, a room on the same course, and a 4-XP question.
insert into public.courses (id,creator_id,title,slug,status,visibility) values
 ('42600000-0000-4000-a000-000000000010','42600000-0000-4000-a000-000000000002','Ordinal','ord-42','published','public');
insert into public.modules (id,course_id,title) values
 ('42600000-0000-4000-a000-000000000011','42600000-0000-4000-a000-000000000010','Modulo');
insert into public.lessons (id,module_id,title,status) values
 ('42600000-0000-4000-a000-000000000012','42600000-0000-4000-a000-000000000011','Aula','published');
insert into public.questions (id,lesson_id,type,prompt,config,xp_value) values
 ('42600000-0000-4000-a000-000000000013','42600000-0000-4000-a000-000000000012','multiple_choice','Escolha A',
  '{"options":[{"id":"a","correct":true},{"id":"b","correct":false}]}',4);
insert into public.rooms (id,educator_id,course_id,name,access_code) values
 ('42600000-0000-4000-a000-000000000030','42600000-0000-4000-a000-000000000002',
  '42600000-0000-4000-a000-000000000010','Sala','ORD001');
insert into public.room_members (room_id,user_id,status) values
 ('42600000-0000-4000-a000-000000000030','42600000-0000-4000-a000-000000000001','active');

set local role authenticated;
set local request.jwt.claim.sub = '42600000-0000-4000-a000-000000000001';
set local request.jwt.claims = '{"sub":"42600000-0000-4000-a000-000000000001","role":"authenticated"}';

-- 1. Three distinct COURSE-context attempts: the first submission of each gets a
--    historical ordinal 1, 2, 3 per (user, question, course context). Abandoning
--    (not finalizing) does not erase the submission nor its ordinal.
do $$
declare
  a1 public.attempts%rowtype; a2 public.attempts%rowtype; a3 public.attempts%rowtype;
  r1 public.answers%rowtype; r2 public.answers%rowtype; r3 public.answers%rowtype;
begin
  select * into a1 from public.start_attempt('42600000-0000-4000-a000-000000000012','42600000-0000-4000-a000-000000000010',null);
  select * into r1 from public.save_attempt_answer(a1.id,'42600000-0000-4000-a000-000000000013','{"selected":["b"]}');
  select * into a2 from public.start_attempt('42600000-0000-4000-a000-000000000012','42600000-0000-4000-a000-000000000010',null);
  select * into r2 from public.save_attempt_answer(a2.id,'42600000-0000-4000-a000-000000000013','{"selected":["b"]}');
  select * into a3 from public.start_attempt('42600000-0000-4000-a000-000000000012','42600000-0000-4000-a000-000000000010',null);
  select * into r3 from public.save_attempt_answer(a3.id,'42600000-0000-4000-a000-000000000013','{"selected":["a"]}');
  if (r1.first_submission_ordinal, r2.first_submission_ordinal, r3.first_submission_ordinal) is distinct from (1,2,3) then
    raise exception 'Ordinal historico do primeiro envio nao progrediu 1,2,3 por usuario/questao/contexto (%,%,%)',
      r1.first_submission_ordinal, r2.first_submission_ordinal, r3.first_submission_ordinal;
  end if;

  -- Resend on the same attempt/question returns the same row and the same ordinal.
  select * into r3 from public.save_attempt_answer(a3.id,'42600000-0000-4000-a000-000000000013','{"selected":["b"]}');
  if r3.first_submission_ordinal <> 3 or r3.submitted <> '{"selected":["a"]}'::jsonb then
    raise exception 'Reenvio renovou ordinal ou substituiu o primeiro envio';
  end if;

  -- Finalize the third (correct) attempt: base 4 / ordinal 3 = 1,3333 decimal credit.
  perform 1 from public.finalize_attempt(a3.id);
end $$;

-- 2. ROOM context is an independent context: the first submission in the room
--    gets ordinal 1 even though the course context already reached 3.
do $$ declare a public.attempts%rowtype; rr public.answers%rowtype; begin
  select * into a from public.start_attempt('42600000-0000-4000-a000-000000000012',null,'42600000-0000-4000-a000-000000000030');
  select * into rr from public.save_attempt_answer(a.id,'42600000-0000-4000-a000-000000000013','{"selected":["a"]}');
  if rr.first_submission_ordinal <> 1 then
    raise exception 'Contexto de sala nao reiniciou o ordinal do primeiro envio (%).', rr.first_submission_ordinal;
  end if;
end $$;

-- 3. The decimal credit book: finalizing the correct course attempt (ordinal 3)
--    wrote a numeric(12,4) credit base/ordinal = 1.3333, unique per context, and
--    the decimal balance accumulated. The legacy integer xp_global is unchanged
--    in shape (still integer) and still credited by the legacy path.
do $$ declare credit numeric; saldo numeric; begin
  select amount into credit from public.learning_credits
   where user_id='42600000-0000-4000-a000-000000000001'
     and question_id='42600000-0000-4000-a000-000000000013'
     and room_id is null;
  if credit is null then
    raise exception 'Credito decimal do contexto curso nao foi gravado';
  end if;
  if round(credit,4) <> 1.3333 then
    raise exception 'Credito base/ordinal esperado 1,3333 e veio %', credit;
  end if;
  select xp_credits into saldo from public.profiles where id='42600000-0000-4000-a000-000000000001';
  if round(saldo,4) <> 1.3333 then
    raise exception 'Saldo decimal vitalicio nao acumulou o credito (%).', saldo;
  end if;
end $$;

-- 4. Unique per context: the same question answered correctly in the room pays a
--    SEPARATE room credit; it never duplicates in the same context.
do $$ declare a public.attempts%rowtype; room_credit numeric; room_saldo numeric; begin
  select id into a from public.attempts where user_id='42600000-0000-4000-a000-000000000001'
    and room_id='42600000-0000-4000-a000-000000000030' order by started_at desc limit 1;
  perform 1 from public.finalize_attempt(a.id);
  select amount into room_credit from public.learning_credits
   where user_id='42600000-0000-4000-a000-000000000001'
     and question_id='42600000-0000-4000-a000-000000000013'
     and room_id='42600000-0000-4000-a000-000000000030';
  if room_credit is null then
    raise exception 'Credito do contexto sala nao foi gravado separadamente';
  end if;
  -- Room ordinal is 1, so base 4 / 1 = 4,0000.
  if round(room_credit,4) <> 4.0000 then
    raise exception 'Credito de sala esperado 4,0000 (base 4 / ordinal 1) e veio %', room_credit;
  end if;
  select credits_internal into room_saldo from public.room_members
   where room_id='42600000-0000-4000-a000-000000000030' and user_id='42600000-0000-4000-a000-000000000001';
  if round(room_saldo,4) <> 4.0000 then
    raise exception 'Saldo decimal da sala nao acumulou o credito (%).', room_saldo;
  end if;
end $$;

-- 5. Replay of finalize does not re-credit: the persisted result is returned and
--    the decimal balance does not grow a second time.
do $$ declare a uuid; saldo_antes numeric; saldo_depois numeric; linhas integer; begin
  select id into a from public.attempts where user_id='42600000-0000-4000-a000-000000000001'
    and room_id is null order by started_at desc limit 1;
  select xp_credits into saldo_antes from public.profiles where id='42600000-0000-4000-a000-000000000001';
  perform 1 from public.finalize_attempt(a);
  select xp_credits into saldo_depois from public.profiles where id='42600000-0000-4000-a000-000000000001';
  if saldo_antes <> saldo_depois then
    raise exception 'Replay do finalizador recreditou o saldo decimal (% -> %).', saldo_antes, saldo_depois;
  end if;
  select count(*) into linhas from public.learning_credits
   where user_id='42600000-0000-4000-a000-000000000001' and room_id is null
     and question_id='42600000-0000-4000-a000-000000000013';
  if linhas <> 1 then
    raise exception 'Replay duplicou a linha de credito do contexto (% linhas).', linhas;
  end if;
end $$;

-- 6. Decimal level respects the integer thresholds: 99,9999 -> level 1, 100 -> level 2.
do $$ begin
  if public.level_for_credits(99.9999) <> 1 then
    raise exception 'Nivel decimal em 99,9999 deveria ser 1 e veio %', public.level_for_credits(99.9999);
  end if;
  if public.level_for_credits(100.0000) <> 2 then
    raise exception 'Nivel decimal em 100 deveria ser 2 e veio %', public.level_for_credits(100.0000);
  end if;
end $$;

-- 7. Legacy first submission (first_submitted_at null) never receives a fabricated
--    ordinal. A known legacy answer row keeps a null ordinal and stays out of the book.
reset role;
insert into public.attempts (id,user_id,lesson_id,course_id) values
 ('42600000-0000-4000-a000-000000000040','42600000-0000-4000-a000-000000000001',
  '42600000-0000-4000-a000-000000000012','42600000-0000-4000-a000-000000000010');
insert into public.answers (attempt_id,question_id,submitted,first_submitted_at,first_submission_ordinal) values
 ('42600000-0000-4000-a000-000000000040','42600000-0000-4000-a000-000000000013','{"selected":["a"]}',null,null);
do $$ declare ord integer; begin
  select first_submission_ordinal into ord from public.answers
   where attempt_id='42600000-0000-4000-a000-000000000040';
  if ord is not null then
    raise exception 'Envio legado desconhecido recebeu ordinal inventado (%).', ord;
  end if;
end $$;

-- 8. Regression for the room_members.updated_at defect (ticket 05 root cause):
--    a legitimate update of a room member row (join_room reactivation of a
--    previously removed membership) must now succeed instead of raising
--    "record new has no field updated_at". This also guards the room-context
--    credit path above, which updates room_members.credits_internal.
update public.room_members set status='removed', removed_at=now()
 where room_id='42600000-0000-4000-a000-000000000030' and user_id='42600000-0000-4000-a000-000000000001';
set local role authenticated;
set local request.jwt.claim.sub = '42600000-0000-4000-a000-000000000001';
set local request.jwt.claims = '{"sub":"42600000-0000-4000-a000-000000000001","role":"authenticated"}';
do $$ declare member_id uuid; begin
  member_id := public.join_room('ORD001');
  if not exists (select 1 from public.room_members
    where id=member_id and status='active' and removed_at is null) then
    raise exception 'Reingresso nao reativou o vinculo existente da sala';
  end if;
end $$;

-- 9. Cross-attempt anti-regrind: a DIFFERENT finalized attempt that answers the
--    same question correctly in the same (course) context pays NO second base
--    credit and does not grow the decimal balance. The legacy integer columns
--    are also left untouched by the decimal path.
set local request.jwt.claim.sub = '42600000-0000-4000-a000-000000000001';
set local request.jwt.claims = '{"sub":"42600000-0000-4000-a000-000000000001","role":"authenticated"}';
do $$
declare
  a public.attempts%rowtype;
  saldo_antes numeric; saldo_depois numeric;
  linhas_antes integer; linhas_depois integer;
  xp_global_antes integer; xp_global_depois integer;
begin
  select xp_credits, xp_global into saldo_antes, xp_global_antes
    from public.profiles where id='42600000-0000-4000-a000-000000000001';
  select count(*) into linhas_antes from public.learning_credits
   where user_id='42600000-0000-4000-a000-000000000001' and room_id is null
     and question_id='42600000-0000-4000-a000-000000000013';

  -- A brand new course-context attempt, answered correctly and finalized.
  select * into a from public.start_attempt('42600000-0000-4000-a000-000000000012','42600000-0000-4000-a000-000000000010',null);
  perform 1 from public.save_attempt_answer(a.id,'42600000-0000-4000-a000-000000000013','{"selected":["a"]}');
  perform 1 from public.finalize_attempt(a.id);

  select xp_credits, xp_global into saldo_depois, xp_global_depois
    from public.profiles where id='42600000-0000-4000-a000-000000000001';
  select count(*) into linhas_depois from public.learning_credits
   where user_id='42600000-0000-4000-a000-000000000001' and room_id is null
     and question_id='42600000-0000-4000-a000-000000000013';

  if saldo_antes <> saldo_depois then
    raise exception 'Regrind entre tentativas recreditou o saldo decimal (% -> %).', saldo_antes, saldo_depois;
  end if;
  if linhas_antes <> linhas_depois then
    raise exception 'Regrind entre tentativas duplicou o credito do contexto (% -> %).', linhas_antes, linhas_depois;
  end if;
  -- The legacy integer path still runs its own policy (anti-regrind zeroes repeat
  -- XP); the decimal book must not have disturbed the integer column shape/value.
  if xp_global_antes <> xp_global_depois then
    raise exception 'Livro decimal alterou o xp_global inteiro legado (% -> %).', xp_global_antes, xp_global_depois;
  end if;
end $$;


