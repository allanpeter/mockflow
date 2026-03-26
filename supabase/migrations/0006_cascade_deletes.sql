-- Fix missing ON DELETE CASCADE on foreign keys referencing profiles.
-- Without these, deleting a user from auth.users fails with a constraint error.

alter table public.bookings
  drop constraint bookings_learner_id_fkey,
  add constraint bookings_learner_id_fkey
    foreign key (learner_id) references public.profiles(id) on delete cascade;

alter table public.reviews
  drop constraint reviews_reviewer_id_fkey,
  add constraint reviews_reviewer_id_fkey
    foreign key (reviewer_id) references public.profiles(id) on delete cascade;

alter table public.payouts
  drop constraint payouts_booking_id_fkey,
  add constraint payouts_booking_id_fkey
    foreign key (booking_id) references public.bookings(id) on delete cascade;
