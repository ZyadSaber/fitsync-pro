-- ============================================================
-- Subscription Plans Migration
-- Adds a subscription_plans catalog table that defines the
-- available platform plan tiers. Updates platform_subscriptions
-- to reference plans via plan_id FK instead of the old
-- hardcoded plan_name check constraint.
-- ============================================================

-- ------------------------------------------------------------
-- 1. subscription_plans — the plan catalog (super-admin managed)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS subscription_plans (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name           TEXT NOT NULL,
  slug           TEXT UNIQUE NOT NULL,
  description    TEXT DEFAULT '',
  price_egp      NUMERIC DEFAULT 0,   -- NULL = contact sales / custom pricing
  billing_cycle  TEXT NOT NULL DEFAULT 'monthly'
                 CHECK (billing_cycle IN ('monthly', 'yearly')),
  duration_days  INT NOT NULL DEFAULT 30,
  member_limit   INT,                 -- NULL = unlimited
  type           TEXT NOT NULL DEFAULT 'gym'
                 CHECK (type IN ('gym', 'online_coach', 'both')),
  features       TEXT[] NOT NULL DEFAULT '{}',
  is_active      BOOLEAN NOT NULL DEFAULT true,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;

-- Super admins can manage all plans
CREATE POLICY "super admin manages subscription_plans" ON subscription_plans
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
        AND p.is_super_admin = true
    )
  );

-- Any authenticated user can read active plans
-- (gyms/coaches need to see available tiers)
CREATE POLICY "authenticated reads active subscription_plans" ON subscription_plans
  FOR SELECT
  USING (is_active = true AND auth.role() = 'authenticated');

-- ------------------------------------------------------------
-- 2. Seed default plans
-- ------------------------------------------------------------
INSERT INTO subscription_plans (name, slug, description, price_egp, billing_cycle, duration_days, member_limit, type, features) VALUES
  ('Trial',      'trial',      '14-day free trial with all Pro features',   0,     'monthly', 14,  100,  'gym',          ARRAY['14 days', 'No card needed', 'All Pro features']),
  ('Starter',    'starter',    'Essential tools for small gyms',            1800,  'monthly', 30,  200,  'gym',          ARRAY['200 members', '5 GB storage', 'Email support']),
  ('Pro',        'pro',        'Full platform for growing gyms',            4500,  'monthly', 30,  1000, 'gym',          ARRAY['1,000 members', '100 GB storage', 'WhatsApp tier', 'Priority support']),
  ('Elite',      'elite',      'Enterprise-grade for large facilities',     9800,  'monthly', 30,  3000, 'gym',          ARRAY['3,000 members', '500 GB storage', 'Multi-branch', 'Dedicated CSM']),
  ('Custom',     'custom',     'Negotiated terms for enterprise clients',   NULL,  'monthly', 30,  6000, 'both',         ARRAY['Negotiated cap', 'SSO + API access', 'SLA 99.95%']),
  ('Coach Solo', 'coach_solo', 'For independent online coaches',            1200,  'monthly', 30,  50,   'online_coach', ARRAY['50 clients', 'Workout builder', 'Nutrition plans']),
  ('Coach Pro',  'coach_pro',  'Scaling online coaching business',          2400,  'monthly', 30,  200,  'online_coach', ARRAY['200 clients', 'All Solo features', 'Analytics', 'Priority support'])
ON CONFLICT (slug) DO NOTHING;

-- Keep the legacy 'enterprise' slug mapped to Elite
INSERT INTO subscription_plans (name, slug, description, price_egp, billing_cycle, duration_days, member_limit, type, features)
  VALUES ('Elite', 'enterprise', 'Enterprise-grade for large facilities (legacy slug)', 9800, 'monthly', 30, 3000, 'gym', ARRAY['3,000 members', '500 GB storage', 'Multi-branch', 'Dedicated CSM'])
ON CONFLICT (slug) DO NOTHING;

-- ------------------------------------------------------------
-- 3. Update platform_subscriptions — add plan_id FK column
--    Keep plan_name for backward compatibility during migration
-- ------------------------------------------------------------
ALTER TABLE platform_subscriptions
  ADD COLUMN IF NOT EXISTS plan_id UUID REFERENCES subscription_plans(id) ON DELETE SET NULL;

-- ------------------------------------------------------------
-- 4. Backfill plan_id from existing plan_name values
-- ------------------------------------------------------------
UPDATE platform_subscriptions ps
SET plan_id = sp.id
FROM subscription_plans sp
WHERE ps.plan_name = sp.slug
  AND ps.plan_id IS NULL;

-- ------------------------------------------------------------
-- 5. Indexes
-- ------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_subscription_plans_type
  ON subscription_plans (type);

CREATE INDEX IF NOT EXISTS idx_subscription_plans_is_active
  ON subscription_plans (is_active);

CREATE INDEX IF NOT EXISTS idx_subscription_plans_slug
  ON subscription_plans (slug);

CREATE INDEX IF NOT EXISTS idx_platform_subscriptions_plan_id
  ON platform_subscriptions (plan_id);
