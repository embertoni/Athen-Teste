-- Ticket 04.6: historical ORDINAL of the first submission + the decimal CREDIT BOOK.
--
-- Two coupled ideas, both built on the first-submission machinery of 0025:
--
-- 1. ORDINAL. Every first submission of a question, by a user, in a context
--    (the individual course, or one specific room), receives an official
--    historical ordinal: 1 for the first such first-submission, 2 for the next
--    distinct attempt's first submission, and so on. It is assigned at
--    first-submission time, serialized on the same attempt-row lock that
--    save_attempt_answer already takes, so concurrent sessions cannot collide.
--    A legacy answer whose first_submitted_at is null (unknown history, 0025)
--    never receives a fabricated ordinal (Q081-Q084): its ordinal stays null.
--    Abandoning an attempt does not erase the submission nor its ordinal.
--
-- 2. CREDIT BOOK. A new decimal ledger, public.learning_credits (numeric(12,4)),
--    one row per base credit, keyed semantically by (user, question, context)
--    and unique per context. The base credit is proportional to the ordinal of
--    the first submission: xp_value / ordinal, rounded once to four places
--    (base 4, ordinal 3 -> 1,3333). Decimal balances live in NEW columns in
--    parallel to the untouched legacy integers (profiles.xp_credits,
--    room_members.credits_internal). The book and balances are written ONLY by
--    the public finalize_attempt, in the same transaction as the immutable
--    result (0023/0027). Replay never re-credits; a question already credited in
--    a context is never paid a second base credit there (anti-regrind by key).
--
-- Deliberate limit: the whole legacy integer calculation in athen_private stays
-- byte-for-byte. No PAC/efficiency (Session 03), no league seasons, no missions,
-- no mass legacy backfill. Bonuses (grant/affinity) are a later slice; only the
-- base credit is paid here.
--
-- Prerequisite fix folded in: this migration also resolves the ticket 05
-- room_members.updated_at trigger defect (0005 never declared the column, 0012
-- installed the generic set_updated_at trigger on the table), because the
-- room-context credit path below updates room_members and would otherwise throw.
-- The fix is the drop of that stray trigger; see the dedicated block.

-- ---------------------------------------------------------------------------
-- Columns: the ordinal on answers, decimal balances on profiles/room_members.
-- ---------------------------------------------------------------------------
alter table public.answers add column first_submission_ordinal integer
  check (first_submission_ordinal is null or first_submission_ordinal >= 1);
comment on column public.answers.first_submission_ordinal is
  'Official historical ordinal of this first submission per (user, question, context: course or specific room). Assigned by save_attempt_answer, serialized on the attempt lock. NULL for legacy rows with unknown first-submission history (never fabricated). Not a credit by itself.';

alter table public.profiles add column xp_credits numeric(12,4) not null default 0
  check (xp_credits >= 0);
comment on column public.profiles.xp_credits is
  'Lifetime decimal credit balance from individual (course-context) learning. Parallel to the legacy integer xp_global, which is preserved unchanged. Written only by finalize_attempt.';

alter table public.room_members add column credits_internal numeric(12,4) not null default 0
  check (credits_internal >= 0);
comment on column public.room_members.credits_internal is
  'Decimal credit balance earned inside this room only. Parallel to the legacy integer xp_internal, preserved unchanged. Never added to profiles.xp_credits.';

-- ---------------------------------------------------------------------------
-- learning_credits: the shared decimal ledger. One row per base credit granted,
-- keyed by (user, question, context). Context is course (room_id null) or a
-- specific room. Uniqueness per context stops a double credit for the same
-- question in the same context, while still allowing one course credit AND one
-- per authorized room.
-- ---------------------------------------------------------------------------
create table public.learning_credits (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles(id) on delete cascade,
  question_id   uuid not null references public.questions(id) on delete cascade,
  attempt_id    uuid not null references public.attempts(id) on delete cascade,
  course_id     uuid references public.courses(id) on delete set null,
  room_id       uuid references public.rooms(id) on delete set null,
  ordinal       integer not null check (ordinal >= 1),
  base_xp       integer not null check (base_xp >= 0),
  amount        numeric(12,4) not null check (amount >= 0),
  granted_at    timestamptz not null default clock_timestamp()
);
-- A room credit and a course credit for the same (user, question) coexist, but
-- never two in the same context. Partial unique indexes express the two shapes.
create unique index learning_credits_course_key
  on public.learning_credits (user_id, question_id) where room_id is null;
create unique index learning_credits_room_key
  on public.learning_credits (user_id, question_id, room_id) where room_id is not null;
create index learning_credits_user_idx on public.learning_credits (user_id, granted_at);
comment on table public.learning_credits is
  'Decimal base-credit ledger. amount = base_xp / ordinal rounded to four places. Unique per (user, question, context: course or specific room). Written only by finalize_attempt; replay/anti-regrind never duplicates a context row. Bonuses and PAC are not stored here.';

alter table public.learning_credits enable row level security;
revoke all on public.learning_credits from public, anon, authenticated;
grant select on public.learning_credits to authenticated;
create policy learning_credits_select_own on public.learning_credits
  for select to authenticated using (
    user_id = auth.uid() and exists (
      select 1 from public.profiles p where p.id = auth.uid() and p.account_status = 'active'
    )
  );

-- ---------------------------------------------------------------------------
-- Fix the latent room_members.updated_at trigger defect (ticket 05 root cause).
-- 0005 never declared room_members.updated_at, yet 0012 installed the generic
-- set_updated_at trigger on it, so EVERY update of a room member row raised
-- "record new has no field updated_at" (touch_updated_at assigns new.updated_at).
-- This already broke the legacy room-context finalize (update xp_internal) and
-- join_room reactivation, and it blocks the room-context decimal credit below.
-- The table has no updated_at column and its readers never expected one, so the
-- correct fix is to drop the stray trigger rather than add an unused column.
drop trigger if exists set_updated_at on public.room_members;

-- ---------------------------------------------------------------------------
-- level_for_credits(numeric): decimal level over the SAME integer thresholds as
-- level_for_xp. The balance is decimal, so the boundary is strict: 99,9999 is
-- still level 1; exactly 100 is level 2. Mirrors the integer bands of 0010.
-- ---------------------------------------------------------------------------
create function public.level_for_credits(p_credits numeric)
returns integer language sql immutable set search_path = '' as $$
  select case
    when p_credits is null or p_credits < 100   then 1
    when p_credits < 250  then 2
    when p_credits < 500  then 3
    when p_credits < 1000 then 4
    when p_credits < 2000 then 5
    else 6 + floor((p_credits - 2000) / 2000)::integer
  end;
$$;
revoke all on function public.level_for_credits(numeric) from public, anon;
grant execute on function public.level_for_credits(numeric) to authenticated;
comment on function public.level_for_credits(numeric) is
  'Decimal-balance level over the integer bands of level_for_xp. 99,9999 -> 1, 100 -> 2. Reads the decimal book, never the legacy integer xp_global.';

-- ---------------------------------------------------------------------------
-- guard_answer_write: additionally freeze first_submission_ordinal on UPDATE,
-- same authority 0025 applies to submitted/first_submitted_at.
-- ---------------------------------------------------------------------------
create or replace function athen_private.guard_answer_write()
returns trigger language plpgsql security definer set search_path = '' as $$
declare a public.attempts%rowtype;
begin
  if tg_op = 'UPDATE' and (new.id <> old.id or new.attempt_id <> old.attempt_id or new.question_id <> old.question_id) then
    raise exception 'answer identity is immutable' using errcode = '42501';
  end if;
  if tg_op = 'UPDATE' and (new.submitted is distinct from old.submitted
    or new.first_submitted_at is distinct from old.first_submitted_at
    or new.first_submission_ordinal is distinct from old.first_submission_ordinal) then
    raise exception 'first submission is immutable' using errcode = '42501';
  end if;
  select * into a from public.attempts where id = new.attempt_id for update;
  if not found or (auth.uid() is not null and a.user_id <> auth.uid()) then
    raise exception 'attempt unavailable' using errcode = '42501';
  end if;
  if auth.uid() is not null and not exists (
    select 1 from public.profiles p where p.id=auth.uid() and p.account_status='active'
  ) then
    raise exception 'active authenticated account required' using errcode = '42501';
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

-- ---------------------------------------------------------------------------
-- save_attempt_answer: preserve-first (from 0025) PLUS historical ordinal.
-- The ordinal counts, within the attempt's context, the user's prior first
-- submissions of the same question that already carry an ordinal, then + 1.
-- The attempt row is locked first (same serialization as 0025), so two
-- concurrent sessions in the same context assign distinct ordinals.
-- ---------------------------------------------------------------------------
create or replace function public.save_attempt_answer(p_attempt_id uuid, p_question_id uuid, p_submitted jsonb)
returns setof public.answers
language plpgsql security definer set search_path = '' as $$
declare a public.attempts%rowtype; r public.answers%rowtype; next_ordinal integer;
begin
  if auth.uid() is null or not exists (
    select 1 from public.profiles p where p.id=auth.uid() and p.account_status='active'
  ) then
    raise exception 'active authenticated account required' using errcode='42501';
  end if;
  -- All answer inserts and finalization serialize on this parent first.
  select * into a from public.attempts where id=p_attempt_id for update;
  if not found or a.user_id <> auth.uid() then
    raise exception 'attempt unavailable' using errcode='42501';
  end if;
  if a.finished_at is not null then
    raise exception 'attempt already finalized' using errcode='42501';
  end if;
  select * into r from public.answers where attempt_id=p_attempt_id and question_id=p_question_id;
  if found then
    return next r;
    return;
  end if;
  -- First submission of this question in this attempt: assign the next historical
  -- ordinal for (user, question, context). Context = the attempt's room, or the
  -- course when room_id is null. Only answers that already carry an ordinal count,
  -- so legacy rows (null ordinal) never shift the sequence.
  select coalesce(max(ans.first_submission_ordinal), 0) + 1 into next_ordinal
    from public.answers ans join public.attempts at2 on at2.id = ans.attempt_id
   where at2.user_id = a.user_id
     and ans.question_id = p_question_id
     and ans.first_submission_ordinal is not null
     and at2.room_id is not distinct from a.room_id;
  return query insert into public.answers(attempt_id,question_id,submitted,first_submission_ordinal)
    values(p_attempt_id,p_question_id,p_submitted,next_ordinal) returning *;
end $$;
revoke all on function public.save_attempt_answer(uuid,uuid,jsonb) from public, anon;
grant execute on function public.save_attempt_answer(uuid,uuid,jsonb) to authenticated;

-- ---------------------------------------------------------------------------
-- athen_private.grant_learning_credits: write the decimal base credits for an
-- attempt, once, in the finalizer's transaction. For each correctly answered
-- question that carries an ordinal and is not yet credited in this context, it
-- inserts a learning_credits row (amount = base_xp / ordinal, 4 places) and adds
-- it to the decimal balance (profiles.xp_credits for course, room_members
-- .credits_internal for room). on conflict do nothing makes it anti-regrind and
-- replay-safe: a context already credited for a question is never paid twice.
-- ---------------------------------------------------------------------------
create function athen_private.grant_learning_credits(p_attempt_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare a public.attempts%rowtype; v_ans record; v_amount numeric; v_room_total numeric := 0; v_course_total numeric := 0;
begin
  select * into a from public.attempts where id = p_attempt_id;
  for v_ans in
    select ans.question_id, ans.first_submission_ordinal as ordinal, q.xp_value
      from public.answers ans join public.questions q on q.id = ans.question_id
     where ans.attempt_id = p_attempt_id
       and ans.is_correct = true
       and ans.first_submission_ordinal is not null
       and q.xp_value > 0
  loop
    v_amount := round(v_ans.xp_value::numeric / v_ans.ordinal, 4);
    if a.room_id is null then
      insert into public.learning_credits (user_id, question_id, attempt_id, course_id, room_id, ordinal, base_xp, amount)
        values (a.user_id, v_ans.question_id, a.id, a.course_id, null, v_ans.ordinal, v_ans.xp_value, v_amount)
        on conflict do nothing;
      if found then v_course_total := v_course_total + v_amount; end if;
    else
      insert into public.learning_credits (user_id, question_id, attempt_id, course_id, room_id, ordinal, base_xp, amount)
        values (a.user_id, v_ans.question_id, a.id, a.course_id, a.room_id, v_ans.ordinal, v_ans.xp_value, v_amount)
        on conflict do nothing;
      if found then v_room_total := v_room_total + v_amount; end if;
    end if;
  end loop;

  if v_course_total > 0 then
    update public.profiles set xp_credits = xp_credits + v_course_total where id = a.user_id;
  end if;
  if v_room_total > 0 then
    update public.room_members set credits_internal = credits_internal + v_room_total
      where room_id = a.room_id and user_id = a.user_id;
  end if;
end $$;
revoke all on function athen_private.grant_learning_credits(uuid) from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- finalize_attempt (public wrapper, from 0027): unchanged authority and legacy
-- integer payment, with ONE addition — after the legacy finalizer runs and the
-- attempt is stamped finished, the decimal base credits are granted in the same
-- transaction. Idempotent replay (existing learning_results row) returns early
-- and never reaches the credit step again; anti-regrind lives in the unique keys.
-- ---------------------------------------------------------------------------
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
    -- New: grant the decimal base credits for this freshly finalized attempt,
    -- in the same transaction. Legacy copies (was_legacy) are never credited.
    perform athen_private.grant_learning_credits(a.id);
  end if;

  insert into public.learning_results
    (attempt_id,user_id,lesson_id,course_id,room_id,confirmed_at,correct_count,total_count,xp_earned,legacy,lesson_version_id)
    values (a.id,a.user_id,a.lesson_id,a.course_id,a.room_id,a.finished_at,
      a.correct_count,a.total_count,a.xp_earned,was_legacy,a.lesson_version_id) returning * into r;
  return query select r.correct_count, r.total_count, r.xp_earned;
end $$;
revoke all on function public.finalize_attempt(uuid) from public, anon;
grant execute on function public.finalize_attempt(uuid) to authenticated;
