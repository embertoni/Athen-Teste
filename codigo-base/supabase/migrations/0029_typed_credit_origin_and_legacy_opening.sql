-- Ticket 04.7 (F3): typed credit ORIGIN, decimal WRITE-PROTECTION, and a
-- conservative audited LEGACY OPENING.
--
-- The decimal book (0028) stored only base credits. The contract requires a
-- typed origin so base/bonus/opening/adjustment are distinguishable in one
-- shared ledger, with "abertura/ajuste separados" and "saldo deve reconciliar
-- com abertura e creditos validos". This slice:
--
-- 1. Adds learning_credits.origin ('base' | 'bonus' | 'opening' | 'adjustment'),
--    default 'base'. Existing rows (all base) take the default. The base-credit
--    uniqueness is re-scoped to origin='base', so an opening/adjustment/bonus row
--    for the same (user, question, context) coexists with the base, while a
--    second base in a context is still rejected.
-- 2. Locks down room_members writes to the legitimate client-managed columns
--    (status, removed_at), mirroring 0024's column grant on profiles, so the
--    server-owned decimal/legacy metric columns (credits_internal, xp_internal,
--    progress, pac_internal) cannot be written by the browser. profiles.xp_credits
--    is ALREADY unwritable by the client (0024 revoked all and granted only the
--    personal columns); this slice keeps that and adds the room_members analogue.
-- 3. Adds open_legacy_credit: an admin-only, audited opening that records an
--    origin='opening' row (one per context) and adjusts the decimal balance.
--    It NEVER fabricates an ordinal or a retroactive base credit and never drives
--    a balance negative (Q081-Q084, "nao inventar ordinais passados"). This is the
--    conservative variant: it establishes the opening/adjustment authority WITHOUT
--    sweeping preexisting results into payment.
--
-- Deliberate limit: snapshot-grading, bonuses (grant/affinity), PAC (Session 03),
-- league seasons and missions are out. The legacy integer finalizer in
-- athen_private stays byte-for-byte. No mass legacy backfill is performed here.

-- ---------------------------------------------------------------------------
-- 1. Typed origin.
-- ---------------------------------------------------------------------------
alter table public.learning_credits add column origin text not null default 'base'
  check (origin in ('base', 'bonus', 'opening', 'adjustment'));
comment on column public.learning_credits.origin is
  'Typed origin of the credit: base (learning), bonus (grant/affinity, later), opening (audited legacy opening) or adjustment (audited admin correction). Only base is written by the finalizer; opening/adjustment by open_legacy_credit.';

-- Audit note for opening/adjustment rows: the admin-supplied justification.
alter table public.learning_credits add column note text;
comment on column public.learning_credits.note is
  'Human-supplied justification, set only for audited opening/adjustment rows by open_legacy_credit. NULL for base/bonus.';

-- An opening/adjustment is context-level, not per question, so question_id and
-- attempt_id become nullable; a CHECK keeps base/bonus question- and
-- attempt-bound while opening/adjustment carry neither.
alter table public.learning_credits alter column question_id drop not null;
alter table public.learning_credits alter column attempt_id drop not null;
alter table public.learning_credits add constraint learning_credits_origin_shape check (
  (origin in ('base', 'bonus') and question_id is not null and attempt_id is not null)
  or (origin in ('opening', 'adjustment') and question_id is null)
);

-- Re-scope the base uniqueness to origin='base' so opening/adjustment/bonus rows
-- can share a (user, question, context) key with the base without colliding, but
-- a second BASE in a context is still rejected (anti-regrind of the base credit).
drop index public.learning_credits_course_key;
drop index public.learning_credits_room_key;
create unique index learning_credits_course_base_key
  on public.learning_credits (user_id, question_id) where room_id is null and origin = 'base';
create unique index learning_credits_room_base_key
  on public.learning_credits (user_id, question_id, room_id) where room_id is not null and origin = 'base';
-- An opening is unique per (user, context) regardless of question: it opens a
-- context balance once. Course and room contexts each get a partial index.
create unique index learning_credits_course_opening_key
  on public.learning_credits (user_id, course_id) where room_id is null and origin = 'opening';
create unique index learning_credits_room_opening_key
  on public.learning_credits (user_id, room_id) where room_id is not null and origin = 'opening';

-- ---------------------------------------------------------------------------
-- 2. Decimal write-protection on room_members (mirror of 0024 for profiles).
-- The browser may only set membership columns; the server-owned metrics
-- (xp_internal, credits_internal, progress, pac_internal) are never client-set.
-- The educator still manages membership via room_members_educator_write RLS
-- (FOR ALL = insert/update/delete), so we re-grant insert and delete at table
-- level and restrict only UPDATE to the membership columns — that is what locks
-- the metric columns without narrowing the educator's insert/delete authority.
-- join_room (SECURITY DEFINER) self-join bypasses column grants.
-- ---------------------------------------------------------------------------
revoke all on public.room_members from public, anon, authenticated;
grant select, insert, delete on public.room_members to authenticated;
grant update (status, removed_at) on public.room_members to authenticated;
comment on column public.room_members.credits_internal is
  'Decimal credit balance earned inside this room only. Parallel to the legacy integer xp_internal, preserved unchanged. Written only by server authority (finalize_attempt / open_legacy_credit); the 0029 column grant excludes it from client UPDATE.';

-- ---------------------------------------------------------------------------
-- 3. open_legacy_credit: admin-only audited opening / adjustment. Conservative:
-- it does NOT read legacy results, fabricate ordinals or pay a base credit. It
-- records one audited origin='opening' row per (user, context) and moves the
-- matching decimal balance. A positive amount opens/credits; a negative amount
-- is an adjustment, but the CHECK (xp_credits/credits_internal >= 0) from 0028
-- rejects any opening that would drive the balance below zero.
-- ---------------------------------------------------------------------------
create function public.open_legacy_credit(
  p_user_id uuid,
  p_course_id uuid,
  p_room_id uuid,
  p_amount numeric,
  p_note text default null
) returns public.learning_credits
language plpgsql security definer set search_path = '' as $$
declare
  v public.learning_credits%rowtype;
  v_origin text := case when p_amount < 0 then 'adjustment' else 'opening' end;
begin
  -- Admin authority only. A non-admin (or no session) is rejected with 42501,
  -- the same code the write-authority paths use.
  if auth.uid() is null or not public.is_admin() then
    raise exception 'admin authority required to open legacy credit' using errcode = '42501';
  end if;
  if p_amount is null or p_amount = 0 then
    raise exception 'opening amount must be non-zero' using errcode = '22023';
  end if;
  if not exists (select 1 from public.profiles p where p.id = p_user_id) then
    raise exception 'unknown beneficiary' using errcode = '22023';
  end if;
  -- Exactly one context: course (room null) XOR a specific room.
  if (p_room_id is null) = (p_course_id is null) then
    raise exception 'opening requires exactly one context' using errcode = '22023';
  end if;

  -- Record the audited ledger row. It is context-level, not per question:
  -- question_id and attempt_id are null (allowed for opening/adjustment by the
  -- origin-shape CHECK). No ordinal is invented (ordinal fixed at 1 as a
  -- structural placeholder for openings; it is not a learning ordinal) and
  -- base_xp is zero (no question graded). The admin note is persisted for audit.
  insert into public.learning_credits
    (user_id, question_id, attempt_id, course_id, room_id, ordinal, base_xp, amount, origin, note)
  values
    (p_user_id, null, null, p_course_id, p_room_id, 1, 0, abs(p_amount), v_origin, p_note)
  returning * into v;

  -- Move the matching decimal balance. The 0028 CHECK (>= 0) guards negatives.
  -- The room branch must hit an existing membership row, else the audited row
  -- would stand without a matching balance move.
  if p_room_id is null then
    update public.profiles set xp_credits = xp_credits + p_amount where id = p_user_id;
  else
    update public.room_members set credits_internal = credits_internal + p_amount
      where room_id = p_room_id and user_id = p_user_id;
    if not found then
      raise exception 'unknown room membership for opening' using errcode = '22023';
    end if;
  end if;
  return v;
end $$;
revoke all on function public.open_legacy_credit(uuid, uuid, uuid, numeric, text) from public, anon, authenticated;
grant execute on function public.open_legacy_credit(uuid, uuid, uuid, numeric, text) to authenticated;
comment on function public.open_legacy_credit(uuid, uuid, uuid, numeric, text) is
  'Admin-only audited legacy opening/adjustment. Records one origin=opening (or adjustment) row per (user, context) and moves the decimal balance. Never fabricates an ordinal or a base credit; never drives a balance negative. Conservative: does not sweep legacy results into payment.';
