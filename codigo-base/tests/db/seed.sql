-- The runner executes the real demo seed twice within this rollback transaction.
set local role authenticated;
set local request.jwt.claim.sub = '00000000-0000-4000-a000-000000000001';
set local request.jwt.claims = '{"sub":"00000000-0000-4000-a000-000000000001","role":"authenticated"}';
do $$ begin
 if not public.is_admin() then
  raise exception 'Seed ficticio nao provisionou o administrador pelo backend';
 end if;
 if (select role from public.profiles where username='ana.prof') <> 'educator'
    or (select role from public.profiles where username='carla.s') <> 'student' then
  raise exception 'Seed ficticio alterou papeis de educador ou aluno';
 end if;
 if (select count(*) from public.profiles where id::text like '00000000-0000-4000-a000-%') <> 7 then
  raise exception 'Reaplicacao do seed duplicou contas ou deixou de criar as sete fixtures';
 end if;
end $$;
