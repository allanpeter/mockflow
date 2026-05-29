-- Deepen tutor profiles with trust/conversion signals (headline, intro video,
-- companies, languages, seniority levels, interview formats, certifications)
-- and expose aggregated public stats (completed sessions + learner return rate)
-- via a view to avoid N+1 queries on the discovery/profile pages.

alter table public.tutor_profiles
  add column if not exists headline text,
  add column if not exists intro_video_url text,
  add column if not exists companies jsonb not null default '[]'::jsonb,
  add column if not exists languages text[] not null default '{}',
  add column if not exists seniority_levels text[] not null default '{}',
  add column if not exists interview_formats text[] not null default '{}',
  add column if not exists certifications text[] not null default '{}';

-- Aggregated, public-safe tutor stats. The view aggregates over private booking
-- rows (only counts, never exposing individual bookings), so it intentionally
-- runs with the view owner's privileges rather than security_invoker.
create or replace view public.tutor_stats as
with booking_agg as (
  select b.tutor_id, b.learner_id, count(*) as bookings_count
  from public.bookings b
  where b.status in ('confirmed', 'completed')
  group by b.tutor_id, b.learner_id
),
learner_agg as (
  select
    tutor_id,
    count(*) as total_learners,
    count(*) filter (where bookings_count > 1) as returning_learners
  from booking_agg
  group by tutor_id
),
session_agg as (
  select b.tutor_id, count(*) as completed_sessions
  from public.sessions s
  join public.bookings b on b.id = s.booking_id
  where s.ends_at < now()
  group by b.tutor_id
)
select
  tp.id as tutor_id,
  coalesce(sa.completed_sessions, 0)::int as completed_sessions,
  coalesce(la.total_learners, 0)::int as total_learners,
  coalesce(la.returning_learners, 0)::int as returning_learners,
  case
    when coalesce(la.total_learners, 0) > 0
      then round(100.0 * coalesce(la.returning_learners, 0) / la.total_learners)::int
    else 0
  end as return_rate
from public.tutor_profiles tp
left join session_agg sa on sa.tutor_id = tp.id
left join learner_agg la on la.tutor_id = tp.id;

grant select on public.tutor_stats to anon, authenticated;
