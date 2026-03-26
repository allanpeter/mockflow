-- Add PIX key fields to tutor_profiles for automated payouts.
alter table public.tutor_profiles
  add column if not exists pix_key text,
  add column if not exists pix_key_type text
    check (pix_key_type in ('cpf', 'cnpj', 'email', 'phone', 'random'));

-- Rename pagarme_transfer_id → transfer_id (platform-agnostic name).
alter table public.payouts
  rename column pagarme_transfer_id to transfer_id;
