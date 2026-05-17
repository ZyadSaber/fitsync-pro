-- ============================================================
-- Storage Buckets
-- Run once to provision Supabase Storage buckets and their RLS
-- policies. Safe to re-run — all statements are guarded.
-- ============================================================

-- ------------------------------------------------------------
-- gym-logos — public bucket for gym logo images
-- Public = true so logo URLs work without a signed token.
-- ------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'gym-logos',
  'gym-logos',
  true,
  2097152,           -- 2 MB limit per file
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Allow super admins and gym owners to upload/update/delete logos
CREATE POLICY "gym owner upload logo"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'gym-logos'
    AND (
      public.is_super_admin()
      OR EXISTS (
        SELECT 1 FROM gyms
        WHERE owner_id = auth.uid()
      )
    )
  );

CREATE POLICY "gym owner update logo"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'gym-logos'
    AND (
      public.is_super_admin()
      OR EXISTS (
        SELECT 1 FROM gyms
        WHERE owner_id = auth.uid()
      )
    )
  );

CREATE POLICY "gym owner delete logo"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'gym-logos'
    AND (
      public.is_super_admin()
      OR EXISTS (
        SELECT 1 FROM gyms
        WHERE owner_id = auth.uid()
      )
    )
  );

-- Anyone (including anonymous) can read logos since the bucket is public
CREATE POLICY "public read gym logos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'gym-logos');
