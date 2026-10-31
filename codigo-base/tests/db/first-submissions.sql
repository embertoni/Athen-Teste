-- The harness rolls back every fixture and assertion.
insert into auth.users (id,email,raw_user_meta_data) values
 ('42300000-0000-4000-a000-000000000001','first-student@example.invalid','{"username":"first-student"}'),
 ('42300000-0000-4000-a000-000000000002','first-author@example.invalid','{"username":"first-author"}');
insert into public.courses (id,creator_id,title,slug,status,visibility) values
 ('42300000-0000-4000-a000-000000000010','42300000-0000-4000-a000-000000000002','Primeiro envio','first-42','published','public');
insert into public.modules (id,course_id,title) values
 ('42300000-0000-4000-a000-000000000011','42300000-0000-4000-a000-000000000010','Modulo');
insert into public.lessons (id,module_id,title,status) values
 ('42300000-0000-4000-a000-000000000012','42300000-0000-4000-a000-000000000011','Aula','published');
insert into public.questions (id,lesson_id,type,prompt,config,xp_value) values
 ('42300000-0000-4000-a000-000000000013','42300000-0000-4000-a000-000000000012','multiple_choice','Escolha A',
  '{"options":[{"id":"a","correct":true},{"id":"b","correct":false}]}',4);
insert into public.attempts (id,user_id,lesson_id,course_id) values
 ('42300000-0000-4000-a000-000000000014','42300000-0000-4000-a000-000000000001',
  '42300000-0000-4000-a000-000000000012','42300000-0000-4000-a000-000000000010');
set local role authenticated;
set local request.jwt.claim.sub = '42300000-0000-4000-a000-000000000001';
set local request.jwt.claims = '{"sub":"42300000-0000-4000-a000-000000000001","role":"authenticated"}';
create temp table first_submission as select to_jsonb(r) as receipt from public.save_attempt_answer(
 '42300000-0000-4000-a000-000000000014','42300000-0000-4000-a000-000000000013','{"selected":["b"]}') r;
do $$ declare saved jsonb; begin
 select to_jsonb(r) into saved from public.save_attempt_answer(
  '42300000-0000-4000-a000-000000000014','42300000-0000-4000-a000-000000000013','{"selected":["a"]}') r;
 if saved is distinct from (select receipt from first_submission) then
  raise exception 'Reenvio substituiu a primeira resposta gravada';
 end if;
end $$;

do $$ declare result record; begin
 if (select receipt->>'first_submitted_at' from first_submission) is null then
  raise exception 'Novo envio nao recebeu instante do servidor';
 end if;
 select * into result from public.finalize_attempt('42300000-0000-4000-a000-000000000014');
 if (result.correct_count,result.total_count,result.xp_earned) is distinct from (0,1,0) then
  raise exception 'Finalizacao deixou de usar a primeira resposta errada';
 end if;
 begin
  perform 1 from public.save_attempt_answer('42300000-0000-4000-a000-000000000014',
   '42300000-0000-4000-a000-000000000013','{"selected":["a"]}');
  raise exception 'Resposta encerrada aceitou novo envio';
 exception when insufficient_privilege then null; end;
end $$;

reset role;
insert into public.attempts (id,user_id,lesson_id,course_id) values
 ('42300000-0000-4000-a000-000000000015','42300000-0000-4000-a000-000000000001',
  '42300000-0000-4000-a000-000000000012','42300000-0000-4000-a000-000000000010'),
 ('42300000-0000-4000-a000-000000000016','42300000-0000-4000-a000-000000000001',
  '42300000-0000-4000-a000-000000000012','42300000-0000-4000-a000-000000000010'),
 ('42300000-0000-4000-a000-000000000017','42300000-0000-4000-a000-000000000001',
  '42300000-0000-4000-a000-000000000012','42300000-0000-4000-a000-000000000010');
-- Explicit legacy fixture: the known stored value has no certified first-send history.
insert into public.answers (attempt_id,question_id,submitted,first_submitted_at) values
 ('42300000-0000-4000-a000-000000000017','42300000-0000-4000-a000-000000000013','{"selected":["b"]}',null);
do $$ begin
 begin
  update public.answers set submitted='{"selected":["a"]}'
   where attempt_id='42300000-0000-4000-a000-000000000017';
  raise exception 'Edicao privilegiada sobrescreveu envio legado conhecido';
 exception when insufficient_privilege then null; end;
 begin
  update public.answers set first_submitted_at=now()
   where attempt_id='42300000-0000-4000-a000-000000000017';
  raise exception 'Edicao privilegiada inventou instante de primeiro envio';
 exception when insufficient_privilege then null; end;
end $$;
set local role authenticated;
do $$ declare result record; saved public.answers%rowtype; begin
 begin
  insert into public.answers(attempt_id,question_id,submitted,first_submitted_at) values
   ('42300000-0000-4000-a000-000000000016','42300000-0000-4000-a000-000000000013',
    '{"selected":["a"]}','1970-01-01T00:00:00Z');
  raise exception 'Cliente forjou instante do primeiro envio';
 exception when insufficient_privilege then null; end;
 select * into saved from public.save_attempt_answer('42300000-0000-4000-a000-000000000017',
  '42300000-0000-4000-a000-000000000013','{"selected":["a"]}');
 if saved.submitted <> '{"selected":["b"]}' or saved.first_submitted_at is not null then
  raise exception 'Reenvio inventou historia ou substituiu resposta legada';
 end if;
 select * into saved from public.save_attempt_answer('42300000-0000-4000-a000-000000000015',
  '42300000-0000-4000-a000-000000000013','{"selected":["a"]}');
 if saved.submitted <> '{"selected":["a"]}' or saved.first_submitted_at is null then
  raise exception 'Nova tentativa nao admitiu novo primeiro envio';
 end if;
 select * into result from public.finalize_attempt('42300000-0000-4000-a000-000000000015');
 if (result.correct_count,result.total_count,result.xp_earned) is distinct from (1,1,4) then
  raise exception 'Correcao oficial legitima deixou de funcionar';
 end if;
end $$;

set local request.jwt.claim.sub = '42300000-0000-4000-a000-000000000002';
set local request.jwt.claims = '{"sub":"42300000-0000-4000-a000-000000000002","role":"authenticated"}';
do $$ begin
 begin
  perform 1 from public.save_attempt_answer('42300000-0000-4000-a000-000000000016',
   '42300000-0000-4000-a000-000000000013','{"selected":["a"]}');
  raise exception 'Outro usuario enviou resposta em tentativa alheia';
 exception when insufficient_privilege then null; end;
end $$;
reset role;
update public.profiles set account_status='deactivated' where id='42300000-0000-4000-a000-000000000001';
set local role authenticated;
set local request.jwt.claim.sub = '42300000-0000-4000-a000-000000000001';
set local request.jwt.claims = '{"sub":"42300000-0000-4000-a000-000000000001","role":"authenticated"}';
do $$ begin
 begin
  insert into public.answers(attempt_id,question_id,submitted) values
   ('42300000-0000-4000-a000-000000000016','42300000-0000-4000-a000-000000000013','{"selected":["a"]}');
  raise exception 'Conta inativa gravou primeiro envio diretamente';
 exception when insufficient_privilege then null; end;
 begin
  perform 1 from public.save_attempt_answer('42300000-0000-4000-a000-000000000016',
   '42300000-0000-4000-a000-000000000013','{"selected":["a"]}');
  raise exception 'Conta inativa gravou primeiro envio pela RPC';
 exception when insufficient_privilege then null; end;
end $$;
