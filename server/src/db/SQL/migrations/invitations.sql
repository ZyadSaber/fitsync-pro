-- ============================================================
-- INVITATIONS
-- ------------------------------------------------------------
-- A single table holding every kind of invitation in the
-- platform. An invitation is a tokenised, expiring email link
-- that, once accepted, provisions or links an account.
--
-- The `type` column drives what the invite does on acceptance:
--   gym_owner    → register the recipient as the owner of `gym_id`
--   online_coach → register the recipient as an independent
--                  (gym-less) online coach        (gym_id NULL)
--   gym_coach    → register/link a coach to `gym_id`
--   gym_member   → link a member to `gym_id`
--   coach_client → link a client to `coach_id`
--
-- This migration ships the FIRST kind end-to-end: `gym_owner`
-- (linking a gym to its owner). The remaining types are listed
-- in the CHECK so the table is ready for them; the columns they
-- need (coach_id, etc.) can be layered on in later migrations.
-- ============================================================

CREATE TABLE IF NOT EXISTS invitations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- What this invitation does once accepted (see header).
  type            TEXT NOT NULL DEFAULT 'gym_owner'
                  CHECK (type IN (
                    'gym_owner',
                    'online_coach',
                    'gym_coach',
                    'gym_member',
                    'coach_client'
                  )),

  -- Single-use secret carried in the invite URL.
  token           TEXT NOT NULL UNIQUE,

  -- Address the invite was sent to.
  email           TEXT NOT NULL,

  -- The account created/linked when the invite is accepted.
  -- NULL until acceptance; "has registered" === user_registered IS NOT NULL.
  user_registered UUID REFERENCES user_credentials(id) ON DELETE SET NULL,

  -- The gym this invite is scoped to. Required for the gym_*
  -- types; NULL for online (gym-less) contexts.
  gym_id          UUID REFERENCES gyms(id) ON DELETE CASCADE,

  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  expired_at      TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '7 days'),
  is_used         BOOLEAN NOT NULL DEFAULT false
);

-- gym_owner / gym_coach / gym_member must name a gym; the online
-- types must not. Keeps the two product modules from crossing over.
ALTER TABLE invitations
  DROP CONSTRAINT IF EXISTS chk_invitation_gym_scope;
ALTER TABLE invitations
  ADD CONSTRAINT chk_invitation_gym_scope CHECK (
    (type IN ('gym_owner', 'gym_coach', 'gym_member') AND gym_id IS NOT NULL)
    OR
    (type IN ('online_coach', 'coach_client')          AND gym_id IS NULL)
  );

-- Token lookups on accept are the hot path.
CREATE UNIQUE INDEX IF NOT EXISTS idx_invitations_token ON invitations (token);

-- Look up outstanding invites by recipient / gym.
CREATE INDEX IF NOT EXISTS idx_invitations_email ON invitations (lower(email));
CREATE INDEX IF NOT EXISTS idx_invitations_gym
  ON invitations (gym_id) WHERE gym_id IS NOT NULL;

-- Fast "is this invite still good?" filter (unused & unexpired).
CREATE INDEX IF NOT EXISTS idx_invitations_pending
  ON invitations (expired_at) WHERE is_used = false;
