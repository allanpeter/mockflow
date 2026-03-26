# Mock Interview Platform — Progress

## Status: In progress

## Stack
- Next.js (app router)
- Supabase (Postgres + Auth)
- Pagar.me
- shadcn/ui + Tailwind
- Deploy: Vercel

## Done
- [x] Project setup
- [x] DB schema (users, tutor_profiles, availability_slots, bookings, sessions, reviews)
- [x] Supabase Auth (email + Google OAuth)
- [x] Role selection on signup (tutor / learner)
- [x] Tutor profile CRUD + RLS
- [x] Availability calendar
- [x] Booking flow
- [ ] Payment integration (Pagar.me, 10% split) — mock mode done, real pending
- [x] Session link generation (Whereby — pending API key)
- [ ] Feedback + rating
- [ ] Payout flow

## Current focus
Tutor profile CRUD

## Known issues / decisions pending
- Session price: set by tutor ✓
- Video: Whereby ✓
- Pagar.me split: automatic ✓
