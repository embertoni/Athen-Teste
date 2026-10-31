-- Administrative fixtures exist only inside this rolled-back transaction.
insert into auth.users (id, email, raw_user_meta_data) values
  ('42000000-0000-4000-a000-000000000001', 'student-42@example.invalid',
   '{"username":"student-42","display_name":"Aluno de ensaio"}'),
  ('42000000-0000-4000-a000-000000000002', 'author-42@example.invalid',
   '{"username":"author-42","display_name":"Autor de ensaio"}');

insert into public.courses (id, creator_id, title, slug, status, visibility) values
  ('42000000-0000-4000-a000-000000000010', '42000000-0000-4000-a000-000000000002',
   'Curso de ensaio', 'curso-ensaio-42', 'published', 'public');
insert into public.modules (id, course_id, title, position) values
  ('42000000-0000-4000-a000-000000000011', '42000000-0000-4000-a000-000000000010', 'Modulo', 0);
insert into public.lessons (id, module_id, title, content, position, status) values
  ('42000000-0000-4000-a000-000000000012', '42000000-0000-4000-a000-000000000011', 'Aula vazia', 'Estudo', 0, 'published');
insert into public.completions (user_id, lesson_id, context) values
  ('42000000-0000-4000-a000-000000000002', '42000000-0000-4000-a000-000000000012', 'course');

set local role authenticated;
set local request.jwt.claim.sub = '42000000-0000-4000-a000-000000000001';
set local request.jwt.claims = '{"sub":"42000000-0000-4000-a000-000000000001","role":"authenticated"}';

do $$ begin
  if current_user <> 'authenticated' or auth.uid() <> '42000000-0000-4000-a000-000000000001'::uuid
    or not row_security_active('public.completions'::regclass) then
    raise exception 'Teste nao esta sob identidade de aluno com RLS ativa';
  end if;
end $$;

select public.complete_empty_lesson('42000000-0000-4000-a000-000000000012');
select public.complete_empty_lesson('42000000-0000-4000-a000-000000000012');

do $$ begin
  if (select count(*) from public.completions where lesson_id = '42000000-0000-4000-a000-000000000012') <> 1 then
    raise exception 'Conclusao nao foi persistida uma unica vez';
  end if;
  if (select xp_global from public.profiles where id = auth.uid()) is distinct from 0 then
    raise exception 'Aula vazia alterou XP';
  end if;
  if (select progress from public.enrollments where user_id = auth.uid()
    and course_id = '42000000-0000-4000-a000-000000000010') is distinct from 100::numeric then
    raise exception 'Progresso oficial nao corresponde a aula concluida';
  end if;
  if exists (select 1 from public.completions where user_id <> auth.uid()) then
    raise exception 'Aluno recebeu conclusao de outro usuario';
  end if;
end $$;
