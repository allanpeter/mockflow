-- ============================================================
-- Auto-create profile row when a new user signs up
-- role is passed via raw_user_meta_data->>'role' at signup
-- ============================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, role, full_name, avatar_url)
  values (
    new.id,
    coalesce(
      (new.raw_user_meta_data->>'role')::public.user_role,
      'learner'
    ),
    coalesce(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',   -- Google OAuth uses 'name'
      split_part(new.email, '@', 1)       -- fallback
    ),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
