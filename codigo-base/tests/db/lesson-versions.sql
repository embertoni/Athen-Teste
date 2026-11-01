-- The harness rolls back every fixture and assertion.
-- Ticket 04.5 / F1: publishing an evaluable VERSION freezes the lesson's
-- question set into an immutable snapshot. Later authorized text edits do not
-- change a frozen version or create a new semantic identity. An attempt records
-- the current version WITHOUT recomputing credit. No decimal credit book here.

insert into auth.users (id,email,raw_user_meta_data) values
 ('42500000-0000-4000-a000-000000000001','ver-student@example.invalid','{"username":"ver-student"}'),
 ('42500000-0000-4000-a000-000000000002','ver-author@example.invalid','{"username":"ver-author"}'),
 ('42500000-0000-4000-a000-000000000003','ver-outsider@example.invalid','{"username":"ver-outsider"}');
insert into public.courses (id,creator_id,title,slug,status,visibility) values
 ('42500000-0000-4000-a000-000000000010','42500000-0000-4000-a000-000000000002','Versionado','ver-42','published','public');
insert into public.modules (id,course_id,title) values
 ('42500000-0000-4000-a000-000000000011','42500000-0000-4000-a000-000000000010','Modulo');
insert into public.lessons (id,module_id,title,status) values
 ('42500000-0000-4000-a000-000000000012','42500000-0000-4000-a000-000000000011','Aula','published');
insert into public.questions (id,lesson_id,type,prompt,config,xp_value) values
 ('42500000-0000-4000-a000-000000000013','42500000-0000-4000-a000-000000000012','multiple_choice','Escolha A',
  '{"options":[{"id":"a","correct":true},{"id":"b","correct":false}]}',4);

-- 1. The author publishes a version: it freezes the current question set.
set local role authenticated;
set local request.jwt.claim.sub = '42500000-0000-4000-a000-000000000002';
set local request.jwt.claims = '{"sub":"42500000-0000-4000-a000-000000000002","role":"authenticated"}';
do $$ declare v public.lesson_versions%rowtype; begin
 select * into v from public.publish_lesson_version('42500000-0000-4000-a000-000000000012');
 if v.lesson_id <> '42500000-0000-4000-a000-000000000012'::uuid or v.version_number <> 1 then
  raise exception 'Primeira versao nao recebeu numero 1 da aula correta';
 end if;
 if v.published_by <> auth.uid() then
  raise exception 'Versao nao registrou o publicador';
 end if;
 -- The snapshot must contain the frozen question with its config.
 if not (v.snapshot -> 'questions' @> '[{"id":"42500000-0000-4000-a000-000000000013"}]'::jsonb) then
  raise exception 'Snapshot nao congelou a questao da aula';
 end if;
end $$;

-- 2. A later authorized text edit does NOT mutate the frozen version.
reset role;
update public.questions set prompt='Escolha A (editado)'
 where id='42500000-0000-4000-a000-000000000013';
do $$ declare snap jsonb; begin
 select snapshot into snap from public.lesson_versions
  where lesson_id='42500000-0000-4000-a000-000000000012' and version_number=1;
 if snap -> 'questions' -> 0 ->> 'prompt' <> 'Escolha A' then
  raise exception 'Edicao de texto alterou o snapshot congelado';
 end if;
end $$;

-- 3. Publishing again after a real change creates version 2; version 1 stays.
set local role authenticated;
set local request.jwt.claim.sub = '42500000-0000-4000-a000-000000000002';
set local request.jwt.claims = '{"sub":"42500000-0000-4000-a000-000000000002","role":"authenticated"}';
do $$ declare v public.lesson_versions%rowtype; begin
 select * into v from public.publish_lesson_version('42500000-0000-4000-a000-000000000012');
 if v.version_number <> 2 then
  raise exception 'Segunda publicacao nao incrementou a versao';
 end if;
 if (select count(*) from public.lesson_versions
      where lesson_id='42500000-0000-4000-a000-000000000012') <> 2 then
  raise exception 'Versao anterior deixou de existir';
 end if;
 if (select snapshot -> 'questions' -> 0 ->> 'prompt' from public.lesson_versions
      where lesson_id='42500000-0000-4000-a000-000000000012' and version_number=2)
    <> 'Escolha A (editado)' then
  raise exception 'Versao 2 nao capturou o texto corrente';
 end if;
end $$;

-- 4. Only the course creator (or admin) may publish a version.
set local request.jwt.claim.sub = '42500000-0000-4000-a000-000000000003';
set local request.jwt.claims = '{"sub":"42500000-0000-4000-a000-000000000003","role":"authenticated"}';
do $$ begin
 begin
  perform 1 from public.publish_lesson_version('42500000-0000-4000-a000-000000000012');
  raise exception 'Nao-autor publicou versao da aula alheia';
 exception
  when insufficient_privilege then null;
  when others then raise exception 'Nao-autor recusado com codigo inesperado: %', sqlstate;
 end;
end $$;

-- 5. An attempt records the CURRENT version and finalizing does not recompute credit.
set local request.jwt.claim.sub = '42500000-0000-4000-a000-000000000001';
set local request.jwt.claims = '{"sub":"42500000-0000-4000-a000-000000000001","role":"authenticated"}';
do $$ declare a public.attempts%rowtype; result record; expected uuid; begin
 select id into expected from public.lesson_versions
  where lesson_id='42500000-0000-4000-a000-000000000012' and version_number=2;
 select * into a from public.start_attempt(
   '42500000-0000-4000-a000-000000000012','42500000-0000-4000-a000-000000000010',null);
 if a.lesson_version_id is distinct from expected then
  raise exception 'Tentativa nao registrou a versao corrente da aula';
 end if;
 perform 1 from public.save_attempt_answer(a.id,'42500000-0000-4000-a000-000000000013','{"selected":["a"]}');
 select * into result from public.finalize_attempt(a.id);
 if (result.correct_count,result.total_count,result.xp_earned) is distinct from (1,1,4) then
  raise exception 'Finalizacao com versao mudou o calculo legado inteiro';
 end if;
 -- The learning result keeps the version used.
 if (select lesson_version_id from public.learning_results where attempt_id=a.id) is distinct from expected then
  raise exception 'Resultado nao preservou a versao avaliada';
 end if;
end $$;

-- 6. A lesson with no published version yet: an attempt starts with NULL version (legacy/unknown).
reset role;
insert into public.lessons (id,module_id,title,status) values
 ('42500000-0000-4000-a000-000000000022','42500000-0000-4000-a000-000000000011','Aula sem versao','published');
insert into public.questions (id,lesson_id,type,prompt,config,xp_value) values
 ('42500000-0000-4000-a000-000000000023','42500000-0000-4000-a000-000000000022','multiple_choice','Q',
  '{"options":[{"id":"a","correct":true}]}',4);
set local role authenticated;
set local request.jwt.claim.sub = '42500000-0000-4000-a000-000000000001';
set local request.jwt.claims = '{"sub":"42500000-0000-4000-a000-000000000001","role":"authenticated"}';
do $$ declare a public.attempts%rowtype; begin
 select * into a from public.start_attempt(
   '42500000-0000-4000-a000-000000000022','42500000-0000-4000-a000-000000000010',null);
 if a.lesson_version_id is not null then
  raise exception 'Aula sem versao publicada deveria iniciar com versao nula';
 end if;
end $$;

-- 7. The version is pinned at START: publishing a new version mid-attempt does
--    not change the version carried onto the result.
do $$ declare a public.attempts%rowtype; started uuid; v3 uuid; begin
 select * into a from public.start_attempt(
   '42500000-0000-4000-a000-000000000012','42500000-0000-4000-a000-000000000010',null);
 started := a.lesson_version_id;
 if started is null then
  raise exception 'Tentativa iniciou sem versao, mas a aula ja tinha versao publicada';
 end if;
 -- The course author publishes a new version while the student's attempt is open.
 reset role;
 update public.questions set prompt='Escolha A (v3)'
  where id='42500000-0000-4000-a000-000000000013';
 set local role authenticated;
 set local request.jwt.claim.sub = '42500000-0000-4000-a000-000000000002';
 set local request.jwt.claims = '{"sub":"42500000-0000-4000-a000-000000000002","role":"authenticated"}';
 select id into v3 from public.publish_lesson_version('42500000-0000-4000-a000-000000000012');
 if v3 = started then
  raise exception 'Nova publicacao nao criou versao distinta';
 end if;
 -- Back to the student, finalize the attempt started under the earlier version.
 set local request.jwt.claim.sub = '42500000-0000-4000-a000-000000000001';
 set local request.jwt.claims = '{"sub":"42500000-0000-4000-a000-000000000001","role":"authenticated"}';
 perform 1 from public.save_attempt_answer(a.id,'42500000-0000-4000-a000-000000000013','{"selected":["a"]}');
 perform 1 from public.finalize_attempt(a.id);
 if (select lesson_version_id from public.learning_results where attempt_id=a.id) is distinct from started then
  raise exception 'Resultado adotou versao publicada depois do inicio, em vez da versao do inicio';
 end if;
end $$;
