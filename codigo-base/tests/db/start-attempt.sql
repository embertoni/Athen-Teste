-- The harness rolls back every fixture and assertion.
-- Ticket 04.4: starting an attempt must derive the user from the server and
-- validate context coherence and access at start time, mirroring the authority
-- finalize_attempt applies at the end. A direct client INSERT never did this.

-- Student, a second author, and an outsider with no access to the private course.
insert into auth.users (id,email,raw_user_meta_data) values
 ('42400000-0000-4000-a000-000000000001','start-student@example.invalid','{"username":"start-student"}'),
 ('42400000-0000-4000-a000-000000000002','start-author@example.invalid','{"username":"start-author"}'),
 ('42400000-0000-4000-a000-000000000003','start-outsider@example.invalid','{"username":"start-outsider"}');

-- Published public course the student may study, and its lesson/question.
insert into public.courses (id,creator_id,title,slug,status,visibility) values
 ('42400000-0000-4000-a000-000000000010','42400000-0000-4000-a000-000000000002','Aberto','start-open-42','published','public'),
 ('42400000-0000-4000-a000-000000000020','42400000-0000-4000-a000-000000000002','Fechado','start-closed-42','draft','private');
insert into public.modules (id,course_id,title) values
 ('42400000-0000-4000-a000-000000000011','42400000-0000-4000-a000-000000000010','Modulo aberto'),
 ('42400000-0000-4000-a000-000000000021','42400000-0000-4000-a000-000000000020','Modulo fechado');
insert into public.lessons (id,module_id,title,status) values
 ('42400000-0000-4000-a000-000000000012','42400000-0000-4000-a000-000000000011','Aula aberta','published'),
 ('42400000-0000-4000-a000-000000000022','42400000-0000-4000-a000-000000000021','Aula fechada','published');
insert into public.questions (id,lesson_id,type,prompt,config,xp_value) values
 ('42400000-0000-4000-a000-000000000013','42400000-0000-4000-a000-000000000012','multiple_choice','Escolha A',
  '{"options":[{"id":"a","correct":true},{"id":"b","correct":false}]}',4);

-- A room bound to the OPEN course, so starting the open lesson with a mismatched
-- room (bound elsewhere) must be rejected. The student is an active member here.
insert into public.rooms (id,educator_id,course_id,name,access_code) values
 ('42400000-0000-4000-a000-000000000030','42400000-0000-4000-a000-000000000002',
  '42400000-0000-4000-a000-000000000010','Sala aberta','STRT01');
insert into public.room_members (room_id,user_id,status) values
 ('42400000-0000-4000-a000-000000000030','42400000-0000-4000-a000-000000000001','active');
-- A second room bound to the CLOSED course: its course does not match the open lesson.
insert into public.rooms (id,educator_id,course_id,name,access_code) values
 ('42400000-0000-4000-a000-000000000031','42400000-0000-4000-a000-000000000002',
  '42400000-0000-4000-a000-000000000020','Sala fechada','STRT02');

set local role authenticated;
set local request.jwt.claim.sub = '42400000-0000-4000-a000-000000000001';
set local request.jwt.claims = '{"sub":"42400000-0000-4000-a000-000000000001","role":"authenticated"}';

-- 1. Authorized course start: the server derives the user and zeroes official fields.
do $$ declare a public.attempts%rowtype; begin
 select * into a from public.start_attempt(
   '42400000-0000-4000-a000-000000000012','42400000-0000-4000-a000-000000000010',null);
 if a.user_id <> auth.uid() then
  raise exception 'Inicio nao derivou o usuario do servidor';
 end if;
 if a.lesson_id <> '42400000-0000-4000-a000-000000000012'::uuid
   or a.course_id <> '42400000-0000-4000-a000-000000000010'::uuid or a.room_id is not null then
  raise exception 'Inicio gravou contexto diferente do solicitado';
 end if;
 if a.finished_at is not null or a.xp_earned <> 0 or a.correct_count <> 0 or a.total_count <> 0 then
  raise exception 'Inicio nao zerou os campos oficiais do servidor';
 end if;
 if not exists (select 1 from public.attempts where id=a.id and user_id=auth.uid()) then
  raise exception 'Tentativa autorizada nao foi persistida';
 end if;
end $$;

-- 2. Authorized room start on the matching room.
do $$ declare a public.attempts%rowtype; begin
 select * into a from public.start_attempt(
   '42400000-0000-4000-a000-000000000012',null,'42400000-0000-4000-a000-000000000030');
 if a.room_id <> '42400000-0000-4000-a000-000000000030'::uuid
   or a.course_id <> '42400000-0000-4000-a000-000000000010'::uuid then
  raise exception 'Inicio de sala nao derivou o curso da aula';
 end if;
end $$;

-- 3. Incoherent course: a course_id that is not the lesson's course is rejected
--    with the same authority code finalize_attempt uses (42501), even when the
--    lesson itself (course 010) is accessible. Null course on this lesson succeeds (test 1).
do $$ begin
 begin
  perform 1 from public.start_attempt(
    '42400000-0000-4000-a000-000000000012','42400000-0000-4000-a000-000000000020',null);
  raise exception 'Inicio aceitou curso incoerente com a aula';
 exception
  when insufficient_privilege then null;
  when others then raise exception 'Curso incoerente recusado com codigo inesperado: %', sqlstate;
 end;
end $$;

-- 4. No access: the closed/private lesson of another author is rejected (42501).
do $$ begin
 begin
  perform 1 from public.start_attempt(
    '42400000-0000-4000-a000-000000000022','42400000-0000-4000-a000-000000000020',null);
  raise exception 'Inicio aceitou aula de curso privado alheio';
 exception
  when insufficient_privilege then null;
  when others then raise exception 'Curso sem acesso recusado com codigo inesperado: %', sqlstate;
 end;
end $$;

-- 5. Mismatched room: a room bound to a different course than the lesson is rejected (42501).
do $$ begin
 begin
  perform 1 from public.start_attempt(
    '42400000-0000-4000-a000-000000000012',null,'42400000-0000-4000-a000-000000000031');
  raise exception 'Inicio aceitou sala de curso diferente da aula';
 exception
  when insufficient_privilege then null;
  when others then raise exception 'Sala incoerente recusada com codigo inesperado: %', sqlstate;
 end;
end $$;

-- 6. The direct client INSERT into attempts is no longer granted.
do $$ begin
 begin
  insert into public.attempts (user_id,lesson_id,course_id) values
   (auth.uid(),'42400000-0000-4000-a000-000000000012','42400000-0000-4000-a000-000000000010');
  raise exception 'Cliente ainda insere tentativa diretamente, sem validacao de servidor';
 exception when insufficient_privilege then null; end;
end $$;

-- 7. An attempt started by the server still finalizes through the same authority.
do $$ declare a public.attempts%rowtype; result record; begin
 select * into a from public.start_attempt(
   '42400000-0000-4000-a000-000000000012','42400000-0000-4000-a000-000000000010',null);
 perform 1 from public.save_attempt_answer(a.id,'42400000-0000-4000-a000-000000000013','{"selected":["a"]}');
 select * into result from public.finalize_attempt(a.id);
 if (result.correct_count,result.total_count,result.xp_earned) is distinct from (1,1,4) then
  raise exception 'Tentativa iniciada pelo servidor nao finalizou como antes';
 end if;
end $$;

-- 8. An outsider with no enrollment and no membership cannot start the open lesson in a room they don't belong to.
set local request.jwt.claim.sub = '42400000-0000-4000-a000-000000000003';
set local request.jwt.claims = '{"sub":"42400000-0000-4000-a000-000000000003","role":"authenticated"}';
do $$ begin
 begin
  perform 1 from public.start_attempt(
    '42400000-0000-4000-a000-000000000012',null,'42400000-0000-4000-a000-000000000030');
  raise exception 'Nao-membro iniciou tentativa em sala alheia';
 exception
  when insufficient_privilege then null;
  when others then raise exception 'Nao-membro recusado com codigo inesperado: %', sqlstate;
 end;
end $$;

-- 9. No session is rejected.
set local request.jwt.claim.sub = '';
set local request.jwt.claims = '{}';
do $$ begin
 begin
  perform 1 from public.start_attempt(
    '42400000-0000-4000-a000-000000000012','42400000-0000-4000-a000-000000000010',null);
  raise exception 'Inicio sem identidade foi aceito';
 exception when insufficient_privilege then null; end;
end $$;

-- 10. A deactivated account is rejected.
reset role;
update public.profiles set account_status='deactivated' where id='42400000-0000-4000-a000-000000000001';
set local role authenticated;
set local request.jwt.claim.sub = '42400000-0000-4000-a000-000000000001';
set local request.jwt.claims = '{"sub":"42400000-0000-4000-a000-000000000001","role":"authenticated"}';
do $$ begin
 begin
  perform 1 from public.start_attempt(
    '42400000-0000-4000-a000-000000000012','42400000-0000-4000-a000-000000000010',null);
  raise exception 'Conta inativa iniciou tentativa';
 exception when insufficient_privilege then null; end;
end $$;
