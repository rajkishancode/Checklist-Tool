-- ReleaseCheck database schema (PostgreSQL).
--
-- A Release is the only model. The fixed checklist steps live in code
-- (lib/steps.js); each release only stores which step keys are completed.
-- The status (planned | ongoing | done) is NOT stored — it is computed
-- from completed_steps at read time.

CREATE TABLE IF NOT EXISTS releases (
  id              SERIAL PRIMARY KEY,
  name            TEXT NOT NULL,                       -- mandatory
  release_date    TIMESTAMPTZ NOT NULL,                -- mandatory
  additional_info TEXT NOT NULL DEFAULT '',            -- optional notes
  completed_steps JSONB NOT NULL DEFAULT '[]'::jsonb,  -- array of completed step keys
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
