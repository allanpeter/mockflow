// This file will be replaced by `supabase gen types typescript` once you have
// a live project. For now it gives full type safety during development.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = 'tutor' | 'learner' | 'admin'
export type BookingStatus = 'pending_payment' | 'confirmed' | 'cancelled' | 'completed'
export type SessionStatus = 'scheduled' | 'in_progress' | 'completed' | 'no_show'
export type PayoutStatus = 'pending' | 'processing' | 'paid' | 'failed'

// Row shapes — defined once, reused below without self-reference
type ProfileRow = {
  id: string
  role: UserRole
  full_name: string
  avatar_url: string | null
  phone: string | null
  goal_seniority: 'Júnior' | 'Pleno' | 'Sênior' | 'Staff+' | null
  created_at: string
  updated_at: string
}

export type Company = { name: string; role?: string; current?: boolean }

type TutorProfileRow = {
  id: string
  user_id: string
  bio: string
  years_experience: number
  tech_stack: string[]
  price_per_session: number
  headline: string | null
  intro_video_url: string | null
  companies: Company[]
  languages: string[]
  seniority_levels: string[]
  interview_formats: string[]
  certifications: string[]
  whereby_room_prefix: string | null
  pagarme_recipient_id: string | null
  pix_key: string | null
  pix_key_type: 'cpf' | 'cnpj' | 'email' | 'phone' | 'random' | null
  cpf: string | null
  bank_code: string | null
  bank_agency: string | null
  bank_account: string | null
  bank_account_digit: string | null
  bank_account_type: 'checking' | 'savings' | null
  is_active: boolean
  created_at: string
  updated_at: string
}

type AvailabilitySlotRow = {
  id: string
  tutor_id: string
  starts_at: string
  ends_at: string
  is_booked: boolean
  created_at: string
}

type BookingRow = {
  id: string
  learner_id: string
  tutor_id: string
  slot_id: string
  status: BookingStatus
  gross_amount: number
  platform_fee: number
  tutor_amount: number
  pagarme_order_id: string | null
  pagarme_charge_id: string | null
  created_at: string
  updated_at: string
}

type SessionRow = {
  id: string
  booking_id: string
  status: SessionStatus
  whereby_room_url: string | null
  whereby_host_room_url: string | null
  starts_at: string
  ends_at: string
  created_at: string
  updated_at: string
}

type ReviewRow = {
  id: string
  session_id: string
  reviewer_id: string
  tutor_id: string
  rating: number
  comment: string | null
  created_at: string
}

type PayoutRow = {
  id: string
  booking_id: string
  tutor_id: string
  amount: number
  status: PayoutStatus
  transfer_id: string | null
  paid_at: string | null
  release_at: string | null
  created_at: string
  updated_at: string
}

export type SeniorityLevel = 'Júnior' | 'Pleno' | 'Sênior' | 'Staff+'

export type SessionFeedbackRow = {
  id: string
  session_id: string
  tutor_id: string
  learner_id: string
  score_communication: number | null
  score_technical: number | null
  score_architecture: number | null
  score_problem_solving: number | null
  score_soft_skills: number | null
  score_maturity: number | null
  estimated_seniority: SeniorityLevel | null
  what_went_well: string | null
  what_to_improve: string | null
  evolution_plan: string | null
  created_at: string
}

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: ProfileRow
        Insert: Omit<ProfileRow, 'created_at' | 'updated_at'>
        Update: Partial<Omit<ProfileRow, 'created_at' | 'updated_at'>>
        Relationships: []
      }
      tutor_profiles: {
        Row: TutorProfileRow
        Insert: Omit<TutorProfileRow, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<TutorProfileRow, 'id' | 'created_at' | 'updated_at'>>
        Relationships: []
      }
      availability_slots: {
        Row: AvailabilitySlotRow
        Insert: Omit<AvailabilitySlotRow, 'id' | 'is_booked' | 'created_at'>
        Update: Partial<Omit<AvailabilitySlotRow, 'id' | 'created_at'>>
        Relationships: []
      }
      bookings: {
        Row: BookingRow
        Insert: Omit<BookingRow, 'id' | 'status' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<BookingRow, 'id' | 'created_at' | 'updated_at'>>
        Relationships: []
      }
      sessions: {
        Row: SessionRow
        Insert: Omit<SessionRow, 'id' | 'status' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<SessionRow, 'id' | 'created_at' | 'updated_at'>>
        Relationships: []
      }
      reviews: {
        Row: ReviewRow
        Insert: Omit<ReviewRow, 'id' | 'created_at'>
        Update: Record<string, never>
        Relationships: []
      }
      payouts: {
        Row: PayoutRow
        Insert: Omit<PayoutRow, 'id' | 'status' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<PayoutRow, 'id' | 'created_at' | 'updated_at'>>
        Relationships: []
      }
      session_feedback: {
        Row: SessionFeedbackRow
        Insert: Omit<SessionFeedbackRow, 'id' | 'created_at'>
        Update: Record<string, never>
        Relationships: []
      }
    }
    Views: {
      tutor_stats: {
        Row: {
          tutor_id: string
          completed_sessions: number
          total_learners: number
          returning_learners: number
          return_rate: number
        }
        Relationships: []
      }
    }
    Functions: {
      create_booking: {
        Args: { p_learner_id: string; p_slot_id: string }
        Returns: string
      }
      delete_user_by_id: {
        Args: { target_user_id: string }
        Returns: void
      }
      cleanup_abandoned_bookings: {
        Args: { p_minutes_old?: number }
        Returns: number
      }
    }
    Enums: {
      user_role: UserRole
      booking_status: BookingStatus
      session_status: SessionStatus
      payout_status: PayoutStatus
    }
  }
}
