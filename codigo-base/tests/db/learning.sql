-- Each invocation runs inside the harness transaction and rolls everything back.
insert into auth.users (id,email,raw_user_meta_data) values
 ('42100000-0000-4000-a000-000000000001','learning-student@example.invalid','{"username":"learning-student","display_name":"Aluno"}'),
 ('42100000-0000-4000-a000-000000000002','learning-author@example.invalid','{"username":"learning-author","display_name":"Autor"}');
insert into public.courses (id,creator_id,title,slug,status,visibility) values
 ('42100000-0000-4000-a000-000000000010','42100000-0000-4000-a000-000000000002','Ensaio','learning-42','published','public');
insert into public.modules (id,course_id,title) values
 ('42100000-0000-4000-a000-000000000011','42100000-0000-4000-a000-000000000010','Modulo');
insert into public.lessons (id,module_id,title,status) values
 ('42100000-0000-4000-a000-000000000012','42100000-0000-4000-a000-000000000011','Aula','published');
insert into public.questions (id,lesson_id,type,prompt,config,xp_value) values
 ('42100000-0000-4000-a000-000000000013','42100000-0000-4000-a000-000000000012','multiple_choice','Escolha A',
  '{"options":[{"id":"a","correct":true},{"id":"b","correct":false}]}',4);
insert into public.attempts (id,user_id,lesson_id,course_id) values
 ('42100000-0000-4000-a000-000000000014','42100000-0000-4000-a000-000000000001',
  '42100000-0000-4000-a000-000000000012','42100000-0000-4000-a000-000000000010');

set local role authenticated;
set local request.jwt.claim.sub = '42100000-0000-4000-a000-000000000001';
set local request.jwt.claims = '{"sub":"42100000-0000-4000-a000-000000000001","role":"authenticated"}';
insert into public.answers (attempt_id,question_id,submitted) values
 ('42100000-0000-4000-a000-000000000014','42100000-0000-4000-a000-000000000013','{"selected":["a"]}');
do $$ declare r record; begin
 select * into r from public.finalize_attempt('42100000-0000-4000-a000-000000000014');
 if (r.correct_count,r.total_count,r.xp_earned) is distinct from (1,1,4) then
  raise exception 'A primeira confirmacao precisa registrar 1/1 e 4 XP';
 end if;
end $$;

create temp table first_confirmation as
 select to_jsonb(r) as receipt from public.get_attempt_confirmation('42100000-0000-4000-a000-000000000014') r;

-- An authorized editorial change after confirmation must not re-grade history.
reset role;
update public.questions set config='{"options":[{"id":"b","correct":true}]}'
 where id='42100000-0000-4000-a000-000000000013';
set local role authenticated;
do $$ declare r record; begin
 select * into r from public.finalize_attempt('42100000-0000-4000-a000-000000000014');
 if (r.correct_count,r.total_count,r.xp_earned) is distinct from (1,1,4) then
  raise exception 'Reenvio alterou a confirmacao oficial: esperado 1/1 e 4 XP, obtido %/% e % XP',
   r.correct_count,r.total_count,r.xp_earned;
 end if;
 if (select xp_global from public.profiles where id=auth.uid()) <> 4 then
  raise exception 'Reenvio duplicou o saldo';
 end if;
end $$;

do $$ begin
 if (select receipt from first_confirmation) is distinct from
   (select to_jsonb(r) from public.get_attempt_confirmation('42100000-0000-4000-a000-000000000014') r) then
  raise exception 'Resultado ou instante oficial mudou no reenvio';
 end if;
 if (select count(*) from public.get_attempt_confirmation('42100000-0000-4000-a000-000000000099')) <> 0 then
  raise exception 'Tentativa desconhecida virou confirmacao ficticia';
 end if;
 begin
  update public.attempts set xp_earned=900 where id='42100000-0000-4000-a000-000000000014';
  raise exception 'Aluno alterou campos oficiais';
 exception when insufficient_privilege then null; end;
 begin
  update public.learning_results set xp_earned=900 where attempt_id='42100000-0000-4000-a000-000000000014';
  raise exception 'Aluno alterou a confirmacao';
 exception when insufficient_privilege then null; end;
 begin
  update public.answers set submitted='{"selected":["b"]}' where attempt_id='42100000-0000-4000-a000-000000000014';
  raise exception 'Aluno alterou resposta finalizada';
 exception when insufficient_privilege then null; end;
 begin
  perform 1 from public.save_attempt_answer('42100000-0000-4000-a000-000000000014',
    '42100000-0000-4000-a000-000000000013','{"selected":["b"]}');
  raise exception 'RPC alterou resposta finalizada';
 exception when insufficient_privilege then null; end;
 begin
  perform 1 from athen_private.finalize_attempt('42100000-0000-4000-a000-000000000014');
  raise exception 'Aluno acessou implementacao interna';
 exception when insufficient_privilege then null; end;
 begin
  insert into public.attempts (user_id,lesson_id,finished_at) values
    (auth.uid(),'42100000-0000-4000-a000-000000000012',now());
  raise exception 'Aluno forjou tentativa finalizada';
 exception when insufficient_privilege then null; end;
end $$;

-- The direct client INSERT is no longer authorized; starting goes through the server.
do $$ begin
 begin
  insert into public.attempts (id,user_id,lesson_id,course_id) values
   ('42100000-0000-4000-a000-000000000015',auth.uid(),'42100000-0000-4000-a000-000000000012',
    '42100000-0000-4000-a000-000000000010');
  raise exception 'Cliente ainda insere tentativa diretamente';
 exception when insufficient_privilege then null; end;
end $$;
-- The authorized start creates the attempt; an incomplete one still cannot finalize.
do $$ declare a public.attempts%rowtype; begin
 select * into a from public.start_attempt(
   '42100000-0000-4000-a000-000000000012','42100000-0000-4000-a000-000000000010',null);
 begin
  perform 1 from public.finalize_attempt(a.id);
  raise exception 'Tentativa incompleta foi finalizada';
 exception when invalid_parameter_value then null; end;
 if (select finished_at from public.attempts where id=a.id) is not null
   or exists (select 1 from public.get_attempt_confirmation(a.id)) then
  raise exception 'Tentativa incompleta produziu confirmacao';
 end if;
end $$;
update public.profiles set display_name='Nome permitido' where id=auth.uid();
do $$ begin
 if (select display_name from public.profiles where id=auth.uid()) <> 'Nome permitido' then
  raise exception 'Edicao legitima de perfil deixou de funcionar';
 end if;
end $$;

set local request.jwt.claim.sub = '42100000-0000-4000-a000-000000000002';
set local request.jwt.claims = '{"sub":"42100000-0000-4000-a000-000000000002","role":"authenticated"}';
do $$ begin
 if exists (select 1 from public.get_attempt_confirmation('42100000-0000-4000-a000-000000000014'))
   or exists (select 1 from public.learning_results) then
  raise exception 'Confirmacao alheia foi exposta';
 end if;
 begin
  perform 1 from public.finalize_attempt('42100000-0000-4000-a000-000000000014');
  raise exception 'Usuario finalizou tentativa alheia';
 exception when insufficient_privilege then null; end;
end $$;
set local request.jwt.claim.sub = '';
set local request.jwt.claims = '{}';
do $$ begin
 begin
  perform 1 from public.finalize_attempt('42100000-0000-4000-a000-000000000014');
  raise exception 'Finalizacao sem identidade foi aceita';
 exception when insufficient_privilege then null; end;
end $$;

reset role;
update public.profiles set account_status='deactivated' where id='42100000-0000-4000-a000-000000000001';
set local request.jwt.claim.sub = '42100000-0000-4000-a000-000000000001';
set local request.jwt.claims = '{"sub":"42100000-0000-4000-a000-000000000001","role":"authenticated"}';
set local role authenticated;
do $$ begin
 begin
  perform 1 from public.get_attempt_confirmation('42100000-0000-4000-a000-000000000014');
  raise exception 'Conta inativa recebeu confirmacao';
 exception when insufficient_privilege then null; end;
end $$;
reset role;
update public.profiles set account_status='active' where id='42100000-0000-4000-a000-000000000001';

-- Inject a persistence failure after grading; the public command must roll back everything.
insert into public.questions (id,lesson_id,type,prompt,config,xp_value) values
 ('42100000-0000-4000-a000-000000000017','42100000-0000-4000-a000-000000000012','multiple_choice','Nova questao',
  '{"options":[{"id":"a","correct":true}]}',4);
create function public.test_reject_confirmation_42() returns trigger language plpgsql as $$
begin raise exception 'Injected receipt failure' using errcode='23514'; end $$;
create trigger test_reject_confirmation_42 before insert on public.learning_results
 for each row when (new.attempt_id='42100000-0000-4000-a000-000000000018')
 execute function public.test_reject_confirmation_42();
-- Fixed-id attempt for the targeted injection trigger; seeded as owner before the role switch.
insert into public.attempts (id,user_id,lesson_id,course_id) values
 ('42100000-0000-4000-a000-000000000018','42100000-0000-4000-a000-000000000001',
  '42100000-0000-4000-a000-000000000012','42100000-0000-4000-a000-000000000010');
set local role authenticated;
select * from public.save_attempt_answer('42100000-0000-4000-a000-000000000018',
 '42100000-0000-4000-a000-000000000013','{"selected":["b"]}');
select * from public.save_attempt_answer('42100000-0000-4000-a000-000000000018',
 '42100000-0000-4000-a000-000000000017','{"selected":["a"]}');
select * from public.save_attempt_answer('42100000-0000-4000-a000-000000000018',
 '42100000-0000-4000-a000-000000000017','{"selected":["a"]}');
do $$ begin
 begin
  perform 1 from public.finalize_attempt('42100000-0000-4000-a000-000000000018');
  raise exception 'Falha injetada nao ocorreu';
 exception when check_violation then null; end;
 if (select xp_global from public.profiles where id=auth.uid()) <> 4
   or (select finished_at from public.attempts where id='42100000-0000-4000-a000-000000000018') is not null
   or exists (select 1 from public.get_attempt_confirmation('42100000-0000-4000-a000-000000000018')) then
  raise exception 'Falha nao reverteu saldo, tentativa ou confirmacao';
 end if;
end $$;
reset role;
drop trigger test_reject_confirmation_42 on public.learning_results;
drop function public.test_reject_confirmation_42();
set local role authenticated;
do $$ declare r record; begin
 select * into r from public.finalize_attempt('42100000-0000-4000-a000-000000000018');
 if (r.correct_count,r.total_count,r.xp_earned) is distinct from (2,2,4)
   or (select xp_global from public.profiles where id=auth.uid()) <> 8 then
  raise exception 'Nova tentativa apos rollback nao confirmou uma unica vez';
 end if;
end $$;

-- Old finished rows are historical reports, never paid again or called newly validated.
reset role;
insert into public.attempts (id,user_id,lesson_id,course_id,finished_at,correct_count,total_count,xp_earned) values
 ('42100000-0000-4000-a000-000000000019','42100000-0000-4000-a000-000000000001',
  '42100000-0000-4000-a000-000000000012','42100000-0000-4000-a000-000000000010','2026-01-01T12:00:00Z',0,1,7);
set local role authenticated;
select * from public.finalize_attempt('42100000-0000-4000-a000-000000000019');
do $$ begin
 if not (select legacy from public.get_attempt_confirmation('42100000-0000-4000-a000-000000000019'))
  or (select xp_global from public.profiles where id=auth.uid()) <> 8 then
  raise exception 'Legado foi repago ou perdeu identificacao historica';
 end if;
end $$;
