-- Structured post-session feedback from tutor to learner (Fase 2).
-- Distinct from the existing `reviews` table (learner→tutor, public star rating).
-- This is tutor→learner, private rubric + evolution plan.

create table public.session_feedback (
  id                   uuid primary key default gen_random_uuid(),
  session_id           uuid unique not null
                         references public.sessions(id) on delete cascade,
  tutor_id             uuid not null
                         references public.tutor_profiles(id) on delete cascade,
  learner_id           uuid not null
                         references public.profiles(id) on delete cascade,

  -- 1–5 rubric dimensions (all optional so tutor can skip inapplicable ones)
  score_communication  smallint check (score_communication  between 1 and 5),
  score_technical      smallint check (score_technical      between 1 and 5),
  score_architecture   smallint check (score_architecture   between 1 and 5),
  score_problem_solving smallint check (score_problem_solving between 1 and 5),
  score_soft_skills    smallint check (score_soft_skills    between 1 and 5),
  score_maturity       smallint check (score_maturity       between 1 and 5),

  estimated_seniority  text check (
    estimated_seniority in ('Júnior', 'Pleno', 'Sênior', 'Staff+')
  ),

  -- Structured text blocks
  what_went_well       text,
  what_to_improve      text,
  evolution_plan       text,

  created_at           timestamptz not null default now()
);

alter table public.session_feedback enable row level security;

-- Tutor can insert feedback for their own sessions
create policy "tutor inserts own session feedback"
  on public.session_feedback for insert
  with check (
    tutor_id = (
      select id from public.tutor_profiles where user_id = auth.uid()
    )
  );

-- Both tutor and learner can read the feedback
create policy "participants read session feedback"
  on public.session_feedback for select
  using (
    learner_id = auth.uid()
    or tutor_id = (
      select id from public.tutor_profiles where user_id = auth.uid()
    )
  );

create index idx_session_feedback_session on public.session_feedback(session_id);
create index idx_session_feedback_learner on public.session_feedback(learner_id);
