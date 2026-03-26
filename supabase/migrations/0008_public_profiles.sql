-- Profiles need to be publicly readable so tutor avatars and names
-- are visible to all users (not just the profile owner).
drop policy if exists "Users can read their own profile" on public.profiles;

create policy "Profiles are publicly readable"
  on public.profiles for select
  using (true);
