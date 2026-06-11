-- Applicants interested in becoming interviewers
CREATE TABLE interviewer_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  linkedin_url TEXT,
  stack TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for email uniqueness and querying
CREATE INDEX idx_interviewer_applications_email ON interviewer_applications(email);
CREATE INDEX idx_interviewer_applications_created_at ON interviewer_applications(created_at DESC);
