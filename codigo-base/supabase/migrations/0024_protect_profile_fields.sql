-- Official profile fields are server-owned. RLS still chooses WHICH rows a
-- caller can manage; column grants choose WHAT can be supplied by the browser.
revoke all on public.profiles from public, anon, authenticated;
-- Delete + reinsert would reset official defaults and cascade away history.
-- Creation belongs to the Auth trigger; destruction belongs to trusted backend.
grant select on public.profiles to authenticated;
grant update (username, display_name, bio, avatar_url, banner_url, notification_preferences)
  on public.profiles to authenticated;

-- These functions are implementation details of confirmed study commands.
-- Their SECURITY DEFINER callers retain execution as the trusted owner.
revoke execute on function public.touch_streak(uuid) from public, anon, authenticated;
revoke execute on function public.grant_medals(uuid) from public, anon, authenticated;

-- Column privileges now reject client role writes instead of silently restoring
-- the old value. Trusted service operations must still be able to provision a role.
drop trigger profiles_role_immutable on public.profiles;
drop function public.enforce_role_immutable();

-- Signup metadata is user-supplied, including when an Auth trigger reads it.
-- Keep the existing student/educator choice; admin is provisioned only by backend.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  v_username public.profiles.username%type;
  v_display_name text;
  v_role public.user_role;
begin
  v_username := nullif(trim(new.raw_user_meta_data ->> 'username'), '');
  if v_username is null then
    v_username := lower(split_part(coalesce(new.email, 'user'), '@', 1))
      || '_' || substr(replace(new.id::text, '-', ''), 1, 6);
  end if;
  v_display_name := coalesce(nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''), v_username::text);
  v_role := case when new.raw_user_meta_data ->> 'role' = 'educator'
    then 'educator'::public.user_role else 'student'::public.user_role end;
  insert into public.profiles (id, username, display_name, role)
    values (new.id, v_username, v_display_name, v_role)
    on conflict (id) do nothing;
  return new;
end $$;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
comment on function public.handle_new_user() is
  'Auth signup trigger: creates student or educator from untrusted metadata; admin and official profile fields require trusted server authority.';

comment on table public.profiles is
  'Profile created by Auth trigger. Client writes are limited to personal fields by column grants and RLS; XP, level, streak, study date, role, account state and timestamps are server-owned.';
