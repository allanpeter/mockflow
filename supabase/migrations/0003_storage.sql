-- Public bucket for avatars and other public assets
insert into storage.buckets (id, name, public)
values ('public-assets', 'public-assets', true)
on conflict (id) do nothing;

-- Anyone can read public assets
create policy "Public assets are readable by everyone"
  on storage.objects for select
  using (bucket_id = 'public-assets');

-- Authenticated users can upload their own avatar
create policy "Users can upload their own avatar"
  on storage.objects for insert
  with check (
    bucket_id = 'public-assets'
    and auth.uid() is not null
    and name like 'avatars/' || auth.uid()::text || '%'
  );

-- Users can update/replace their own avatar
create policy "Users can update their own avatar"
  on storage.objects for update
  using (
    bucket_id = 'public-assets'
    and auth.uid() is not null
    and name like 'avatars/' || auth.uid()::text || '%'
  );
