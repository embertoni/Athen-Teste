-- Ticket 04.5 / F1: evaluable lesson VERSIONS (snapshots).
--
-- A version is an immutable, published freeze of a lesson's question set
-- (prompt + type + config + xp_value), captured at publish time. Later authorized
-- text edits to the live questions do NOT mutate a frozen version and do NOT
-- create a new semantic identity on their own; a new version is created only by
-- an explicit re-publish. Attempts record the current version so results can be
-- read against the exact evaluated set (Q142 adoption).
--
-- Deliberate limit: this slice does NOT compute decimal credit, ordinal or PAC.
-- finalize_attempt keeps the whole legacy integer calculation untouched; the
-- only change is that it carries the recorded version onto learning_results.

create table public.lesson_versions (
  id             uuid primary key default gen_random_uuid(),
  lesson_id      uuid not null references public.lessons(id) on delete cascade,
  version_number integer not null check (version_number >= 1),
  snapshot       jsonb not null,
  published_by   uuid not null references public.profiles(id) on delete cascade,
  published_at   timestamptz not null default clock_timestamp(),
  unique (lesson_id, version_number)
);
create index lesson_versions_lesson_idx on public.lesson_versions(lesson_id, version_number desc);
comment on table public.lesson_versions is
  'Immutable published snapshot of a lesson question set. A new row is a new version; live text edits never mutate an existing snapshot. Not a credit, ordinal or PAC event.';

alter table public.lesson_versions enable row level security;
revoke all on public.lesson_versions from public, anon, authenticated;
grant select on public.lesson_versions to authenticated;
-- Readable when the caller can read the owning course (mirrors course readability).
create policy lesson_versions_select on public.lesson_versions
  for select to authenticated using (
    exists (
      select 1 from public.lessons l
        join public.modules m on m.id = l.module_id
        join public.courses c on c.id = m.course_id
       where l.id = lesson_versions.lesson_id
         and (c.creator_id = auth.uid() or public.is_admin()
              or (c.status = 'published' and c.visibility = 'public'))
    )
  );

-- Carry the evaluated version on attempts and persisted results (NULL = legacy/unknown).
alter table public.attempts add column lesson_version_id uuid references public.lesson_versions(id) on delete set null;
alter table public.learning_results add column lesson_version_id uuid references public.lesson_versions(id) on delete set null;
comment on column public.attempts.lesson_version_id is
  'The lesson version in force when the attempt started. NULL when no version was published yet (legacy/unknown). Not a snapshot of answers.';

-- publish_lesson_version: freeze the current question set as the next version.
-- Only the course creator (or admin) may publish. SECURITY DEFINER so it can
-- read the full question set regardless of the caller-scoped policies.
create function public.publish_lesson_version(p_lesson_id uuid)
returns public.lesson_versions
language plpgsql security definer set search_path = '' as $$
declare
  v public.lesson_versions%rowtype;
  creator uuid;
  next_number integer;
  snap jsonb;
begin
  if auth.uid() is null or not exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.account_status = 'active'
  ) then
    raise exception 'active authenticated account required' using errcode = '42501';
  end if;
  select c.creator_id into creator
    from public.lessons l
    join public.modules m on m.id = l.module_id
    join public.courses c on c.id = m.course_id
   where l.id = p_lesson_id;
  if creator is null then
    raise exception 'invalid lesson' using errcode = '22023';
  end if;
  if creator <> auth.uid() and not public.is_admin() then
    raise exception 'not authorized to publish this lesson' using errcode = '42501';
  end if;

  -- Lock the lesson row so concurrent publishes serialize and version numbers are unique.
  perform 1 from public.lessons where id = p_lesson_id for update;

  select coalesce(max(version_number), 0) + 1 into next_number
    from public.lesson_versions where lesson_id = p_lesson_id;

  -- Freeze the identity-bearing fields of every question, ordered deterministically.
  select jsonb_build_object(
           'lesson_id', p_lesson_id,
           'questions', coalesce(jsonb_agg(
             jsonb_build_object(
               'id', q.id, 'type', q.type, 'prompt', q.prompt,
               'position', q.position, 'config', q.config, 'xp_value', q.xp_value
             ) order by q.position, q.id
           ), '[]'::jsonb)
         ) into snap
    from public.questions q where q.lesson_id = p_lesson_id;

  insert into public.lesson_versions (lesson_id, version_number, snapshot, published_by)
    values (p_lesson_id, next_number, snap, auth.uid())
    returning * into v;
  return v;
end $$;
revoke all on function public.publish_lesson_version(uuid) from public, anon;
grant execute on function public.publish_lesson_version(uuid) to authenticated;
comment on function public.publish_lesson_version(uuid) is
  'Freeze the lesson question set as the next immutable version. Course creator or admin only. Does not pay credit or change grading.';

-- Helper: the latest published version id for a lesson, or NULL.
create function public.current_lesson_version(p_lesson_id uuid)
returns uuid language sql stable security definer set search_path = '' as $$
  select id from public.lesson_versions
   where lesson_id = p_lesson_id
   order by version_number desc limit 1;
$$;
revoke all on function public.current_lesson_version(uuid) from public, anon;
grant execute on function public.current_lesson_version(uuid) to authenticated;

-- Re-create start_attempt (from 0026) to record the current version at start.
-- The authorization logic is unchanged; only the recorded version is added.
create or replace function public.start_attempt(
  p_lesson_id uuid,
  p_course_id uuid default null,
  p_room_id uuid default null
) returns public.attempts
language plpgsql security definer set search_path = '' as $$
declare
  a public.attempts%rowtype;
  c public.courses%rowtype;
  course uuid;
  lesson_status public.content_status;
  version uuid;
begin
  if auth.uid() is null or not exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.account_status = 'active'
  ) then
    raise exception 'active authenticated account required' using errcode = '42501';
  end if;

  select m.course_id, l.status into course, lesson_status
    from public.lessons l join public.modules m on m.id = l.module_id
    where l.id = p_lesson_id;
  if course is null then
    raise exception 'invalid attempt lesson' using errcode = '22023';
  end if;
  if p_course_id is not null and p_course_id <> course then
    raise exception 'invalid attempt course' using errcode = '42501';
  end if;

  select * into c from public.courses where id = course;
  if p_room_id is null then
    if not ((c.status = 'published' and c.visibility = 'public' and lesson_status = 'published')
      or c.creator_id = auth.uid()
      or (lesson_status = 'published' and exists (
        select 1 from public.enrollments e where e.user_id = auth.uid() and e.course_id = course
          and e.status in ('active', 'completed')
      ))) then
      raise exception 'course unavailable' using errcode = '42501';
    end if;
  elsif not exists (
    select 1 from public.rooms rm where rm.id = p_room_id and rm.course_id = course
      and (rm.educator_id = auth.uid() or exists (
        select 1 from public.room_members mb where mb.room_id = rm.id
          and mb.user_id = auth.uid() and mb.status = 'active'
      ))
  ) then
    raise exception 'room unavailable' using errcode = '42501';
  end if;

  version := public.current_lesson_version(p_lesson_id);

  insert into public.attempts (user_id, lesson_id, course_id, room_id, lesson_version_id)
    values (auth.uid(), p_lesson_id, course, p_room_id, version)
    returning * into a;
  return a;
end $$;
revoke all on function public.start_attempt(uuid, uuid, uuid) from public, anon;
grant execute on function public.start_attempt(uuid, uuid, uuid) to authenticated;

-- Re-create the public finalize_attempt (from 0023) to persist the attempt's
-- recorded version onto learning_results. Grading/payment logic is byte-identical.
create or replace function public.finalize_attempt(p_attempt_id uuid)
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
  -- The recorded lesson version (if any) travels onto the persisted result.
  insert into public.learning_results
    (attempt_id,user_id,lesson_id,course_id,room_id,confirmed_at,correct_count,total_count,xp_earned,legacy,lesson_version_id)
    values (a.id,a.user_id,a.lesson_id,a.course_id,a.room_id,a.finished_at,
      a.correct_count,a.total_count,a.xp_earned,was_legacy,a.lesson_version_id) returning * into r;
  return query select r.correct_count, r.total_count, r.xp_earned;
end $$;
revoke all on function public.finalize_attempt(uuid) from public, anon;
grant execute on function public.finalize_attempt(uuid) to authenticated;
