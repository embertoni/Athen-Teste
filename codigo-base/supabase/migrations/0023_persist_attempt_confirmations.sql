-- First slice of ticket 04: stable receipts, NOT the new decimal credit engine.
-- Preserve 0018's grading/payment policy behind a single public entry point.
create schema athen_private;
revoke all on schema athen_private from public, anon, authenticated;
alter function public.finalize_attempt(uuid) set schema athen_private;
revoke all on function athen_private.finalize_attempt(uuid) from public, anon, authenticated;

create table public.learning_results (
  attempt_id uuid primary key references public.attempts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  course_id uuid references public.courses(id) on delete set null,
  room_id uuid references public.rooms(id) on delete set null,
  confirmed_at timestamptz not null,
  correct_count integer not null check (correct_count >= 0),
  total_count integer not null check (total_count >= correct_count),
  xp_earned integer not null check (xp_earned >= 0),
  legacy boolean not null
);
create index learning_results_user_idx on public.learning_results(user_id, confirmed_at);
alter table public.learning_results enable row level security;
revoke all on public.learning_results from public, anon, authenticated;
grant select on public.learning_results to authenticated;
create policy learning_results_select_own on public.learning_results
  for select to authenticated using (
    user_id = auth.uid() and exists (
      select 1 from public.profiles p where p.id = auth.uid() and p.account_status = 'active'
    )
  );

-- Close direct forgery of final fields without changing legitimate start/upsert payloads.
revoke all on public.attempts from public, anon, authenticated;
grant select on public.attempts to authenticated;
grant insert (id, user_id, lesson_id, course_id, room_id) on public.attempts to authenticated;
revoke all on public.answers from public, anon, authenticated;
grant select on public.answers to authenticated;
grant insert (id, attempt_id, question_id, submitted) on public.answers to authenticated;

-- Answer writes and finalization serialize on the same attempt row.
create function athen_private.guard_answer_write()
returns trigger language plpgsql security definer set search_path = '' as $$
declare a public.attempts%rowtype;
begin
  if tg_op = 'UPDATE' and (new.attempt_id <> old.attempt_id or new.question_id <> old.question_id) then
    raise exception 'answer identity is immutable' using errcode = '42501';
  end if;
  select * into a from public.attempts where id = new.attempt_id for update;
  if not found or (auth.uid() is not null and a.user_id <> auth.uid()) then
    raise exception 'attempt unavailable' using errcode = '42501';
  end if;
  if a.finished_at is not null then
    raise exception 'attempt already finalized' using errcode = '42501';
  end if;
  if not exists (select 1 from public.questions q where q.id = new.question_id and q.lesson_id = a.lesson_id) then
    raise exception 'question does not belong to attempt lesson' using errcode = '22023';
  end if;
  return new;
end $$;
revoke all on function athen_private.guard_answer_write() from public, anon, authenticated;
create trigger answers_guard_write before insert or update on public.answers
  for each row execute function athen_private.guard_answer_write();

-- A row-level UPDATE trigger runs after the answer row has been locked.
-- Therefore updates use this command, which locks the attempt FIRST, just like finalize.
create function public.save_attempt_answer(p_attempt_id uuid, p_question_id uuid, p_submitted jsonb)
returns setof public.answers
language plpgsql security definer set search_path = '' as $$
declare a public.attempts%rowtype;
begin
  if auth.uid() is null or not exists (
    select 1 from public.profiles p where p.id=auth.uid() and p.account_status='active'
  ) then
    raise exception 'active authenticated account required' using errcode='42501';
  end if;
  select * into a from public.attempts where id=p_attempt_id for update;
  if not found or a.user_id <> auth.uid() then
    raise exception 'attempt unavailable' using errcode='42501';
  end if;
  return query insert into public.answers(attempt_id,question_id,submitted)
    values(p_attempt_id,p_question_id,p_submitted)
    on conflict(attempt_id,question_id) do update set submitted=excluded.submitted
    returning *;
end $$;
revoke all on function public.save_attempt_answer(uuid,uuid,jsonb) from public, anon;
grant execute on function public.save_attempt_answer(uuid,uuid,jsonb) to authenticated;

create function public.finalize_attempt(p_attempt_id uuid)
returns table (correct_count integer, total_count integer, xp_earned integer)
language plpgsql security definer set search_path = '' as $$
declare
  a public.attempts%rowtype;
  r public.learning_results%rowtype;
  c public.courses%rowtype;
  course uuid;
  lesson_status public.content_status;
  expected integer;
  answered integer;
  was_legacy boolean;
begin
  if auth.uid() is null or not exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.account_status = 'active'
  ) then
    raise exception 'active authenticated account required' using errcode = '42501';
  end if;
  select * into a from public.attempts where id = p_attempt_id for update;
  if not found or a.user_id <> auth.uid() then
    raise exception 'attempt unavailable' using errcode = '42501';
  end if;
  select * into r from public.learning_results lr where lr.attempt_id = p_attempt_id;
  if found then
    return query select r.correct_count, r.total_count, r.xp_earned;
    return;
  end if;

  was_legacy := a.finished_at is not null;
  if not was_legacy then
    -- Freeze the current set only during finalization. Start-time versions are a later slice.
    select m.course_id, l.status into course, lesson_status
      from public.lessons l join public.modules m on m.id = l.module_id
      where l.id = a.lesson_id for update of l;
    if course is null or (a.course_id is not null and a.course_id <> course) then
      raise exception 'invalid attempt course' using errcode = '42501';
    end if;
    select * into c from public.courses where id = course;
    if a.room_id is null then
      if not ((c.status = 'published' and c.visibility = 'public' and lesson_status = 'published')
        or c.creator_id = auth.uid()
        or (lesson_status = 'published' and exists (
          select 1 from public.enrollments e where e.user_id = auth.uid() and e.course_id = course
            and e.status in ('active', 'completed')
        ))) then
        raise exception 'course unavailable' using errcode = '42501';
      end if;
    elsif not exists (
      select 1 from public.rooms rm where rm.id = a.room_id and rm.course_id = course
        and (rm.educator_id = auth.uid() or exists (
          select 1 from public.room_members mb where mb.room_id = rm.id
            and mb.user_id = auth.uid() and mb.status = 'active'
        ))
    ) then
      raise exception 'room unavailable' using errcode = '42501';
    end if;

    perform q.id from public.questions q where q.lesson_id = a.lesson_id order by q.id for share;
    select count(*) into expected from public.questions q where q.lesson_id = a.lesson_id;
    select count(*) into answered from public.answers ans join public.questions q on q.id = ans.question_id
      where ans.attempt_id = a.id and q.lesson_id = a.lesson_id;
    if expected = 0 or answered <> expected
       or (select count(*) from public.answers ans where ans.attempt_id = a.id) <> expected then
      raise exception 'attempt incomplete' using errcode = '22023';
    end if;
    perform 1 from athen_private.finalize_attempt(p_attempt_id);
    update public.attempts set finished_at = clock_timestamp() where id = a.id returning * into a;
  end if;

  -- Legacy closed attempts are copied as legacy, never re-graded or paid again.
  insert into public.learning_results
    (attempt_id,user_id,lesson_id,course_id,room_id,confirmed_at,correct_count,total_count,xp_earned,legacy)
    values (a.id,a.user_id,a.lesson_id,a.course_id,a.room_id,a.finished_at,
      a.correct_count,a.total_count,a.xp_earned,was_legacy) returning * into r;
  return query select r.correct_count, r.total_count, r.xp_earned;
end $$;
revoke all on function public.finalize_attempt(uuid) from public, anon;
grant execute on function public.finalize_attempt(uuid) to authenticated;

create function public.get_attempt_confirmation(p_attempt_id uuid)
returns table (attempt_id uuid, confirmed_at timestamptz, correct_count integer,
  total_count integer, xp_earned integer, legacy boolean)
language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null or not exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.account_status = 'active'
  ) then
    raise exception 'active authenticated account required' using errcode = '42501';
  end if;
  return query select r.attempt_id,r.confirmed_at,r.correct_count,r.total_count,r.xp_earned,r.legacy
    from public.learning_results r where r.attempt_id = p_attempt_id and r.user_id = auth.uid();
end $$;
revoke all on function public.get_attempt_confirmation(uuid) from public, anon;
grant execute on function public.get_attempt_confirmation(uuid) to authenticated;

comment on table public.learning_results is
  'Persisted confirmation: replay never re-grades or pays again. Legacy copies retain old reported values, not a newly validated run. Decimal credits and start-time snapshots are not implemented here.';
