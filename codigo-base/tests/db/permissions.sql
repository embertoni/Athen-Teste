-- Public table writes are the security seam; fixtures are rolled back by the harness.
insert into auth.users (id,email,raw_user_meta_data) values
 ('42200000-0000-4000-a000-000000000001','permissions-student@example.invalid','{"username":"permissions-student","display_name":"Aluno"}');

set local role authenticated;
set local request.jwt.claim.sub = '42200000-0000-4000-a000-000000000001';
set local request.jwt.claims = '{"sub":"42200000-0000-4000-a000-000000000001","role":"authenticated"}';

do $$ begin
 begin
  update public.profiles set xp_global=900 where id=auth.uid();
  raise exception 'Aluno conseguiu forjar o proprio XP';
 exception when insufficient_privilege then null; end;
 if (select xp_global from public.profiles where id=auth.uid()) <> 0 then
  raise exception 'Tentativa de escrita alterou o saldo oficial';
 end if;
end $$;

-- Privilege is checked even for no-op writes and cannot be bypassed by mixing
-- an editable field into the same statement. None of these tests uses an admin connection.
do $$ declare field text; value text; begin
 for field,value in select * from (values
  ('id', 'id'), ('role', '''educator'''), ('level', '20'), ('streak_count', '20'),
  ('last_study_date', 'date ''2026-10-31'''), ('account_status', '''deactivated'''),
  ('created_at', 'now()'), ('updated_at', 'now()')
 ) as writes(field,value) loop
  begin
   execute format('update public.profiles set %I=%s where id=auth.uid()',field,value);
   raise exception 'Aluno escreveu campo oficial %',field;
  exception when insufficient_privilege then null; end;
 end loop;
 begin
  update public.profiles set display_name='Nao deve persistir',xp_global=900 where id=auth.uid();
  raise exception 'Atualizacao mista alterou XP';
 exception when insufficient_privilege then null; end;
 if (select display_name from public.profiles where id=auth.uid()) <> 'Aluno' then
  raise exception 'Atualizacao mista foi parcialmente aplicada';
 end if;
end $$;

update public.profiles set username='permissions-edited',display_name='Nome editado',bio='Bio editada',
 avatar_url='https://example.invalid/avatar.png',banner_url='https://example.invalid/banner.png',
 notification_preferences='{"pedido_amizade":false}' where id=auth.uid();
do $$ begin
 if not exists (select 1 from public.profiles where id=auth.uid()
   and username='permissions-edited' and display_name='Nome editado' and bio='Bio editada'
   and avatar_url='https://example.invalid/avatar.png' and banner_url='https://example.invalid/banner.png'
   and notification_preferences='{"pedido_amizade":false}' and xp_global=0 and level=1
   and streak_count=0 and last_study_date is null and role='student' and account_status='active') then
  raise exception 'Edicao pessoal legitima deixou de funcionar ou alterou projeções';
 end if;
end $$;

reset role;
insert into auth.users (id,email,raw_user_meta_data) values
 ('42200000-0000-4000-a000-000000000002','permissions-admin-metadata@example.invalid',
  '{"username":"permissions-admin-metadata","role":"admin","xp_global":900,"level":20}'),
 ('42200000-0000-4000-a000-000000000003','permissions-educator@example.invalid',
  '{"username":"permissions-educator","role":"educator"}'),
 ('42200000-0000-4000-a000-000000000004','permissions-invalid-role@example.invalid',
  '{"role":"invalid"}');
set local role authenticated;
do $$ begin
 if (select role from public.profiles where id='42200000-0000-4000-a000-000000000002') <> 'student' then
  raise exception 'Metadata do cadastro concedeu cargo administrativo';
 end if;
 if (select role from public.profiles where id='42200000-0000-4000-a000-000000000003') <> 'educator'
    or (select role from public.profiles where id='42200000-0000-4000-a000-000000000004') <> 'student' then
  raise exception 'Cadastro legitimo ou fallback de cargo deixou de funcionar';
 end if;
 if (select xp_global from public.profiles where id='42200000-0000-4000-a000-000000000002') <> 0 then
  raise exception 'Metadata do cadastro forjou XP';
 end if;
end $$;

-- A trusted service can provision admin; that browser session still has no
-- privilege to fabricate XP, roles or account state through table writes.
reset role;
set local role service_role;
update public.profiles set role='admin' where id='42200000-0000-4000-a000-000000000002';
set local role authenticated;
set local request.jwt.claim.sub = '42200000-0000-4000-a000-000000000002';
set local request.jwt.claims = '{"sub":"42200000-0000-4000-a000-000000000002","role":"authenticated"}';
do $$ begin
 if not public.is_admin() then raise exception 'Provisionamento confiavel de administrador falhou'; end if;
 begin
  delete from public.profiles where id='42200000-0000-4000-a000-000000000003';
  raise exception 'Browser administrativo excluiu perfil e permitiu resetar os campos oficiais';
 exception when insufficient_privilege then null; end;
 begin
  insert into public.profiles (id,username,display_name)
   values ('42200000-0000-4000-a000-000000000099','recreated','Recreated');
  raise exception 'Browser administrativo recriou perfil com defaults oficiais';
 exception when insufficient_privilege then null; end;
 begin
  update public.profiles set xp_global=900 where id=auth.uid();
  raise exception 'Browser administrativo forjou XP';
 exception when insufficient_privilege then null; end;
 begin
  update public.profiles set role='educator' where id='42200000-0000-4000-a000-000000000001';
  raise exception 'Browser administrativo alterou cargo';
 exception when insufficient_privilege then null; end;
 begin
  insert into public.profiles (id,username,display_name,xp_global)
   values ('42200000-0000-4000-a000-000000000099','forged','Forged',900);
  raise exception 'Browser administrativo forjou saldo no insert';
 exception when insufficient_privilege then null; end;
 begin
  truncate public.profiles cascade;
  raise exception 'Browser administrativo executou truncate';
 exception when insufficient_privilege then null; end;
end $$;

set local request.jwt.claim.sub = '42200000-0000-4000-a000-000000000001';
set local request.jwt.claims = '{"sub":"42200000-0000-4000-a000-000000000001","role":"authenticated"}';
update public.profiles set display_name='Intrusao' where id='42200000-0000-4000-a000-000000000003';
do $$ begin
 if (select display_name from public.profiles where id='42200000-0000-4000-a000-000000000003') = 'Intrusao' then
  raise exception 'Aluno editou perfil alheio';
 end if;
end $$;

reset role;
insert into public.courses (id,creator_id,title,slug,status,visibility) values
 ('42200000-0000-4000-a000-000000000010','42200000-0000-4000-a000-000000000003','Ensaio','permissions-42','published','public');
insert into public.modules (id,course_id,title) values
 ('42200000-0000-4000-a000-000000000011','42200000-0000-4000-a000-000000000010','Modulo');
insert into public.lessons (id,module_id,title,status) values
 ('42200000-0000-4000-a000-000000000012','42200000-0000-4000-a000-000000000011','Aula sem questoes','published');
set local role authenticated;
select public.complete_empty_lesson('42200000-0000-4000-a000-000000000012');
select public.complete_empty_lesson('42200000-0000-4000-a000-000000000012');
do $$ begin
 if not exists (select 1 from public.profiles where id=auth.uid() and xp_global=0 and level=1
   and streak_count=1 and last_study_date=(now() at time zone 'America/Sao_Paulo')::date) then
  raise exception 'Estudo legitimo deixou de atualizar streak ou alterou saldo';
 end if;
 if (select count(*) from public.user_medals where user_id=auth.uid() and medal_code='first_lesson') <> 1 then
  raise exception 'Estudo legitimo deixou de conceder medalha unica';
 end if;
end $$;
select public.deactivate_account();
do $$ begin
 if not exists (select 1 from public.profiles where id=auth.uid()
   and account_status='deactivated' and display_name='Usuário removido'
   and bio is null and avatar_url is null and banner_url is null) then
  raise exception 'Desativacao legitima deixou de funcionar';
 end if;
 begin
  update public.profiles set account_status='active' where id=auth.uid();
  raise exception 'Cliente reativou conta por escrita direta';
 exception when insufficient_privilege then null; end;
end $$;

set local role anon;
do $$ begin
 begin
  update public.profiles set display_name='Anonimo';
  raise exception 'Anonimo editou perfis';
 exception when insufficient_privilege then null; end;
 begin
  perform public.touch_streak('42200000-0000-4000-a000-000000000001');
  raise exception 'Anonimo executou helper de streak';
 exception when insufficient_privilege then null; end;
 begin
  perform public.grant_medals('42200000-0000-4000-a000-000000000001');
  raise exception 'Anonimo executou helper de medalhas';
 exception when insufficient_privilege then null; end;
end $$;

-- A profile grant alone must not leave a privileged function as a bypass.
set local role authenticated;
set local request.jwt.claim.sub = '42200000-0000-4000-a000-000000000003';
set local request.jwt.claims = '{"sub":"42200000-0000-4000-a000-000000000003","role":"authenticated"}';
do $$ begin
 begin
  perform public.touch_streak(auth.uid());
  raise exception 'Aluno conseguiu fabricar atividade por touch_streak';
 exception when insufficient_privilege then null; end;
 begin
  perform public.grant_medals(auth.uid());
  raise exception 'Aluno executou a concessao interna de medalhas';
 exception when insufficient_privilege then null; end;
end $$;
