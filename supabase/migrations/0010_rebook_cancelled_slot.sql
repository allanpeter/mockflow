-- ============================================================
-- Allow rebooking a cancelled slot
-- ============================================================
--
-- ISSUE: The blanket UNIQUE constraint on bookings.slot_id
-- prevented the same slot from being booked again after cancellation.
--
-- SOLUTION: Replace with a partial unique index that only applies
-- to non-cancelled bookings. This allows:
--   1. Same slot to be rebooked after cancellation
--   2. No duplicate concurrent active bookings on one slot

-- Drop the blanket unique constraint
alter table public.bookings drop constraint bookings_slot_id_key;

-- Create a partial unique index: only one active booking per slot
create unique index bookings_active_slot_unique
  on public.bookings(slot_id)
  where status not in ('cancelled');
