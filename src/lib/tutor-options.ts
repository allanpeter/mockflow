// Fixed option sets for tutor profiles. Stored as plain string labels on
// tutor_profiles (mirrors how tech_stack is stored) so they're easy to filter.

export const INTERVIEW_FORMATS = [
  'Coding',
  'System Design',
  'Behavioral',
  'Code Review',
  'Mentoria',
  'Revisão de currículo',
] as const

export const SENIORITY_LEVELS = ['Júnior', 'Pleno', 'Sênior', 'Staff+'] as const

export const LANGUAGES = ['Português', 'Inglês', 'Espanhol'] as const

export type InterviewFormat = (typeof INTERVIEW_FORMATS)[number]
export type SeniorityLevel = (typeof SENIORITY_LEVELS)[number]
export type Language = (typeof LANGUAGES)[number]
