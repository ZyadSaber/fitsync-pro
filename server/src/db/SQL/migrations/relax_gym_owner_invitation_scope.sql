-- ============================================================
-- Relax the gym scope of `gym_owner` invitations
-- ------------------------------------------------------------
-- Originally gym_owner was treated as gym-scoped (it required a gym_id), grouped
-- with gym_coach / gym_member. But a gym_owner invite provisions a BRAND-NEW gym
-- + owner account on accept — there is no gym to point at yet, so it belongs with
-- the platform-level types. This moves gym_owner from the "gym_id NOT NULL" group
-- to the "gym_id NULL" group of chk_invitation_gym_scope.
--
-- full_schema.sql is the source of truth and already carries the new definition;
-- this script brings an existing database in line. Idempotent (drop + re-add).
-- ============================================================

ALTER TABLE invitations
  DROP CONSTRAINT IF EXISTS chk_invitation_gym_scope;

ALTER TABLE invitations
  ADD CONSTRAINT chk_invitation_gym_scope CHECK (
    (type IN ('gym_coach', 'gym_member') AND gym_id IS NOT NULL)
    OR
    (type IN ('gym_owner', 'online_coach', 'coach_client') AND gym_id IS NULL)
  );
