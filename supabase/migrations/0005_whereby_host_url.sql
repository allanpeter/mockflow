-- Add host room URL so tutors get the privileged Whereby link
alter table public.sessions
  add column if not exists whereby_host_room_url text;
