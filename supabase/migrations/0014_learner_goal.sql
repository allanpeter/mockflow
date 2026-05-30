-- Add seniority goal to profiles so learners can declare their target level.
-- Kept on the profiles table to avoid a join on every progress page load.
alter table public.profiles
  add column if not exists goal_seniority text
    check (goal_seniority in ('Júnior', 'Pleno', 'Sênior', 'Staff+'));
