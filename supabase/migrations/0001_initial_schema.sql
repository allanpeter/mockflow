-- ============================================================
-- MockFlow — initial schema
-- ============================================================

-- Enable pgcrypto for gen_random_uuid() (already available in Supabase)
-- Enable moddatetime extension for updated_at triggers
create extension if not exists moddatetime schema extensions;

-- ============================================================
-- ENUMS
-- ============================================================

create type public.user_role as enum ('tutor', 'learner');
create type public.booking_status as enum ('pending_payment', 'confirmed', 'cancelled', 'completed');
create type public.session_status as enum ('scheduled', 'in_progress', 'completed', 'no_show');
create type public.payout_status as enum ('pending', 'processing', 'paid', 'failed');

-- ============================================================
-- PROFILES  (extends auth.users 1-to-1)
-- ============================================================

create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  role        public.user_role not null,
  full_name   text not null,
  avatar_url  text,
  phone       text,                          -- used for Pagar.me customer
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute procedure extensions.moddatetime(updated_at);

-- ============================================================
-- TUTOR PROFILES
-- ============================================================

create table public.tutor_profiles (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null unique references public.profiles(id) on delete cascade,
  bio                 text not null,
  years_experience    smallint not null check (years_experience >= 0),
  tech_stack          text[] not null default '{}',   -- e.g. ['TypeScript','Node','React']
  price_per_session   numeric(10,2) not null check (price_per_session > 0),  -- BRL
  whereby_room_prefix text,                            -- e.g. 'joao-silva' → room names suffixed with booking id
  pagarme_recipient_id text,                           -- tutor's Pagar.me recipient id for splits
  is_active           boolean not null default false, -- goes live only after profile complete
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create trigger tutor_profiles_updated_at
  before update on public.tutor_profiles
  for each row execute procedure extensions.moddatetime(updated_at);

-- ============================================================
-- AVAILABILITY SLOTS
-- ============================================================

create table public.availability_slots (
  id          uuid primary key default gen_random_uuid(),
  tutor_id    uuid not null references public.tutor_profiles(id) on delete cascade,
  starts_at   timestamptz not null,
  ends_at     timestamptz not null,
  is_booked   boolean not null default false,
  created_at  timestamptz not null default now(),

  constraint no_zero_duration check (ends_at > starts_at),
  -- Prevent duplicate/overlapping slots at DB level
  constraint unique_tutor_slot unique (tutor_id, starts_at)
);

create index idx_slots_tutor_starts on public.availability_slots(tutor_id, starts_at)
  where is_booked = false;

-- ============================================================
-- BOOKINGS
-- ============================================================

create table public.bookings (
  id                  uuid primary key default gen_random_uuid(),
  learner_id          uuid not null references public.profiles(id),
  tutor_id            uuid not null references public.tutor_profiles(id),
  slot_id             uuid not null unique references public.availability_slots(id),  -- 1 booking per slot
  status              public.booking_status not null default 'pending_payment',

  -- Pricing snapshot (never recalculate after booking)
  gross_amount        numeric(10,2) not null,   -- tutor price at time of booking
  platform_fee        numeric(10,2) not null,   -- 10% of gross_amount
  tutor_amount        numeric(10,2) not null,   -- 90% of gross_amount

  -- Pagar.me
  pagarme_order_id    text unique,
  pagarme_charge_id   text unique,

  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),

  constraint fee_integrity check (
    platform_fee = round(gross_amount * 0.10, 2) and
    tutor_amount = round(gross_amount * 0.90, 2)
  )
);

create trigger bookings_updated_at
  before update on public.bookings
  for each row execute procedure extensions.moddatetime(updated_at);

create index idx_bookings_learner on public.bookings(learner_id);
create index idx_bookings_tutor   on public.bookings(tutor_id);

-- ============================================================
-- SESSIONS  (created on payment confirmation)
-- ============================================================

create table public.sessions (
  id              uuid primary key default gen_random_uuid(),
  booking_id      uuid not null unique references public.bookings(id) on delete cascade,
  status          public.session_status not null default 'scheduled',
  whereby_room_url text,                    -- auto-created via Whereby API
  starts_at       timestamptz not null,
  ends_at         timestamptz not null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create trigger sessions_updated_at
  before update on public.sessions
  for each row execute procedure extensions.moddatetime(updated_at);

-- ============================================================
-- REVIEWS  (learner reviews tutor after session)
-- ============================================================

create table public.reviews (
  id          uuid primary key default gen_random_uuid(),
  session_id  uuid not null unique references public.sessions(id) on delete cascade,
  reviewer_id uuid not null references public.profiles(id),
  tutor_id    uuid not null references public.tutor_profiles(id),
  rating      smallint not null check (rating between 1 and 5),
  comment     text,
  created_at  timestamptz not null default now()
);

create index idx_reviews_tutor on public.reviews(tutor_id);

-- ============================================================
-- PAYOUTS
-- ============================================================

create table public.payouts (
  id                   uuid primary key default gen_random_uuid(),
  booking_id           uuid not null unique references public.bookings(id),
  tutor_id             uuid not null references public.tutor_profiles(id),
  amount               numeric(10,2) not null,    -- tutor_amount from booking
  status               public.payout_status not null default 'pending',
  pagarme_transfer_id  text unique,
  paid_at              timestamptz,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

create trigger payouts_updated_at
  before update on public.payouts
  for each row execute procedure extensions.moddatetime(updated_at);

-- ============================================================
-- FUNCTION: lock slot + create booking atomically
-- Called from a server action, not directly by the client.
-- ============================================================

create or replace function public.create_booking(
  p_learner_id  uuid,
  p_slot_id     uuid
)
returns uuid   -- returns new booking id
language plpgsql
security definer
set search_path = public
as $$
declare
  v_slot        public.availability_slots%rowtype;
  v_tutor       public.tutor_profiles%rowtype;
  v_gross       numeric(10,2);
  v_fee         numeric(10,2);
  v_booking_id  uuid;
begin
  -- Lock the slot row to prevent concurrent bookings
  select * into v_slot
  from public.availability_slots
  where id = p_slot_id and is_booked = false
  for update skip locked;

  if not found then
    raise exception 'slot_unavailable' using errcode = 'P0001';
  end if;

  select * into v_tutor from public.tutor_profiles where id = v_slot.tutor_id;

  v_gross := v_tutor.price_per_session;
  v_fee   := round(v_gross * 0.10, 2);

  insert into public.bookings (
    learner_id, tutor_id, slot_id,
    gross_amount, platform_fee, tutor_amount
  ) values (
    p_learner_id, v_tutor.id, p_slot_id,
    v_gross, v_fee, v_gross - v_fee
  )
  returning id into v_booking_id;

  -- Lock the slot
  update public.availability_slots set is_booked = true where id = p_slot_id;

  return v_booking_id;
end;
$$;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.profiles            enable row level security;
alter table public.tutor_profiles      enable row level security;
alter table public.availability_slots  enable row level security;
alter table public.bookings            enable row level security;
alter table public.sessions            enable row level security;
alter table public.reviews             enable row level security;
alter table public.payouts             enable row level security;

-- ---------- profiles ----------
create policy "Users can read their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- ---------- tutor_profiles ----------
-- Anyone can read active tutor profiles (browse page)
create policy "Active tutor profiles are public"
  on public.tutor_profiles for select
  using (is_active = true or auth.uid() = user_id);

create policy "Tutors manage their own profile"
  on public.tutor_profiles for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ---------- availability_slots ----------
-- Anyone authenticated can read un-booked slots (needed for booking)
create policy "Slots are publicly readable"
  on public.availability_slots for select
  using (true);

create policy "Tutors manage their own slots"
  on public.availability_slots for all
  using (
    tutor_id in (
      select id from public.tutor_profiles where user_id = auth.uid()
    )
  )
  with check (
    tutor_id in (
      select id from public.tutor_profiles where user_id = auth.uid()
    )
  );

-- ---------- bookings ----------
create policy "Learners see their own bookings"
  on public.bookings for select
  using (auth.uid() = learner_id);

create policy "Tutors see bookings for their profile"
  on public.bookings for select
  using (
    tutor_id in (
      select id from public.tutor_profiles where user_id = auth.uid()
    )
  );

-- Bookings are created via security-definer function, not direct insert
-- No insert policy needed for learners.

-- ---------- sessions ----------
create policy "Session participants can view their session"
  on public.sessions for select
  using (
    booking_id in (
      select id from public.bookings
      where learner_id = auth.uid()
         or tutor_id in (
              select id from public.tutor_profiles where user_id = auth.uid()
            )
    )
  );

-- ---------- reviews ----------
create policy "Reviews are public"
  on public.reviews for select
  using (true);

create policy "Learner can insert review for their session"
  on public.reviews for insert
  with check (
    auth.uid() = reviewer_id
    and session_id in (
      select s.id from public.sessions s
      join public.bookings b on b.id = s.booking_id
      where b.learner_id = auth.uid()
        and s.status = 'completed'
    )
  );

-- ---------- payouts ----------
create policy "Tutors see their own payouts"
  on public.payouts for select
  using (
    tutor_id in (
      select id from public.tutor_profiles where user_id = auth.uid()
    )
  );
