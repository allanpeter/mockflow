-- ============================================================
-- Defer slot lock until payment confirmation
-- ============================================================
--
-- ISSUE: Slots are locked immediately when booking is initiated,
-- even if payment is abandoned. This prevents rebooking.
--
-- SOLUTION: Only lock the slot when payment is confirmed.
-- The FOR UPDATE SKIP LOCKED check still prevents concurrent
-- pending bookings. A cleanup RPC handles orphaned pending_payment bookings.

-- Recreate create_booking without the is_booked update
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
  -- Note: is_booked will be set to true only after payment confirmation
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

  -- Note: is_booked will be set to true in the webhook after payment confirmation

  return v_booking_id;
end;
$$;

-- Create RPC to cleanup abandoned pending_payment bookings
create or replace function public.cleanup_abandoned_bookings(
  p_minutes_old integer default 30
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
begin
  -- Find and cancel pending_payment bookings older than p_minutes_old
  update public.bookings
  set status = 'cancelled'
  where
    status = 'pending_payment'
    and created_at < now() - (p_minutes_old || ' minutes')::interval;

  get diagnostics v_count = row_count;
  return v_count;
end;
$$;
