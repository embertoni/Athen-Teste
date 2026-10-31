-- Old answers may already have been overwritten. Do not fabricate their first
-- submission time; only new rows receive a server timestamp after this cut.
alter table public.answers add column first_submitted_at timestamptz;
alter table public.answers alter column first_submitted_at set default clock_timestamp();
comment on column public.answers.first_submitted_at is
  'Server receipt time of the first stored answer after 0025. NULL means legacy first-submission history is unknown; not an ordinal, snapshot or confirmed learning result.';

create or replace function athen_private.guard_answer_write()
returns trigger language plpgsql security definer set search_path = '' as $$
declare a public.attempts%rowtype;
begin
  if tg_op = 'UPDATE' and (new.id <> old.id or new.attempt_id <> old.attempt_id or new.question_id <> old.question_id) then
    raise exception 'answer identity is immutable' using errcode = '42501';
  end if;
  if tg_op = 'UPDATE' and (new.submitted is distinct from old.submitted
    or new.first_submitted_at is distinct from old.first_submitted_at) then
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

create or replace function public.save_attempt_answer(p_attempt_id uuid, p_question_id uuid, p_submitted jsonb)
returns setof public.answers
language plpgsql security definer set search_path = '' as $$
declare a public.attempts%rowtype; r public.answers%rowtype;
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
  return query insert into public.answers(attempt_id,question_id,submitted)
    values(p_attempt_id,p_question_id,p_submitted) returning *;
end $$;
revoke all on function public.save_attempt_answer(uuid,uuid,jsonb) from public, anon;
grant execute on function public.save_attempt_answer(uuid,uuid,jsonb) to authenticated;
