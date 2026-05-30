-- Tutor bank account details for Pagar.me recipient creation
ALTER TABLE tutor_profiles ADD COLUMN IF NOT EXISTS cpf TEXT;
ALTER TABLE tutor_profiles ADD COLUMN IF NOT EXISTS bank_code TEXT;
ALTER TABLE tutor_profiles ADD COLUMN IF NOT EXISTS bank_agency TEXT;
ALTER TABLE tutor_profiles ADD COLUMN IF NOT EXISTS bank_account TEXT;
ALTER TABLE tutor_profiles ADD COLUMN IF NOT EXISTS bank_account_digit TEXT;
ALTER TABLE tutor_profiles ADD COLUMN IF NOT EXISTS bank_account_type TEXT
  CHECK (bank_account_type IN ('checking', 'savings'));

-- Payout release timestamp (when the tutor's session ends = when money is released)
ALTER TABLE payouts ADD COLUMN IF NOT EXISTS release_at TIMESTAMPTZ;
