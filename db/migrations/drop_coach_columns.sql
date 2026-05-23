-- ============================================================
-- Migration: drop is_online_coach and public_slug from coaches
-- All coaches accessible via /management are online-only (gym_id IS NULL).
-- public_slug is moving to the profiles table or a dedicated URL system.
-- ============================================================

ALTER TABLE coaches
  DROP COLUMN IF EXISTS is_online_coach,
  DROP COLUMN IF EXISTS public_slug;
