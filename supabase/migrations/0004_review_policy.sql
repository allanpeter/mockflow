-- Allow learner to insert a review for any past session they attended
-- (session ends_at < now), regardless of session status.
-- The unique constraint on reviews.session_id prevents duplicate reviews.

drop policy if exists "Learner can insert review for their session" on public.reviews;

create policy "Learner can insert review for their session"
  on public.reviews for insert
  with check (
    auth.uid() = reviewer_id
    and session_id in (
      select s.id from public.sessions s
      join public.bookings b on b.id = s.booking_id
      where b.learner_id = auth.uid()
        and s.ends_at < now()
    )
  );
