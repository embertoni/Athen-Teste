-- Ticket 04.4: authorize and validate the START of an attempt on the server.
-- Until now the client INSERTed into public.attempts directly: it sent user_id,
-- lesson_id, course_id and room_id, and only RLS (user_id = auth.uid()) plus the
-- column grant guarded it. Context coherence and access were checked only at the
-- end, in finalize_attempt. This slice moves that same authority to the start,
-- so an attempt can only be born with a user derived from auth.uid() and a
-- coherent, authorized context.
--
-- Deliberate limit: this does NOT snapshot the lesson at start, publish/version,
-- resume across sessions, assign a historical ordinal, or open a decimal credit
-- book. Payment authority stays solely in finalize_attempt. The lesson set is
-- still frozen only during finalization.

create function public.start_attempt(
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
begin
  if auth.uid() is null or not exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.account_status = 'active'
  ) then
    raise exception 'active authenticated account required' using errcode = '42501';
  end if;

  -- Derive the lesson's course; a lesson that does not resolve is unavailable.
  select m.course_id, l.status into course, lesson_status
    from public.lessons l join public.modules m on m.id = l.module_id
    where l.id = p_lesson_id;
  if course is null then
    raise exception 'invalid attempt lesson' using errcode = '22023';
  end if;
  -- A client-supplied course must match the lesson's real course. Same authority
  -- finalize_attempt applies to an attempt's stored course (errcode 42501).
  if p_course_id is not null and p_course_id <> course then
    raise exception 'invalid attempt course' using errcode = '42501';
  end if;

  select * into c from public.courses where id = course;
  -- Same access authority finalize_attempt applies, evaluated here at start time.
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

  insert into public.attempts (user_id, lesson_id, course_id, room_id)
    values (auth.uid(), p_lesson_id, course, p_room_id)
    returning * into a;
  return a;
end $$;
revoke all on function public.start_attempt(uuid, uuid, uuid) from public, anon;
grant execute on function public.start_attempt(uuid, uuid, uuid) to authenticated;

-- The client no longer forges the start payload directly; start_attempt owns it.
-- SELECT stays so owners read their own attempts (RLS attempts_select_own).
revoke insert on public.attempts from authenticated;

comment on function public.start_attempt(uuid, uuid, uuid) is
  'Authorized attempt start: user derived from auth.uid(), context coherence and access validated at start, official fields left server-controlled. Not a snapshot, version, ordinal or credit event.';
