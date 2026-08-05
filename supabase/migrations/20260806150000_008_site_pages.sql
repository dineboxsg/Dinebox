CREATE TABLE IF NOT EXISTS site_pages (
  slug text PRIMARY KEY CHECK (slug IN ('privacy', 'terms', 'contact')),
  title text NOT NULL,
  content text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO site_pages (slug, title, content) VALUES
  ('privacy', 'Privacy Policy', E'DineBox respects your privacy. We collect only the information needed to operate the platform, provide our services, and improve your experience.\n\nWe may use anonymous activity data to understand how DineBox is used. We do not sell personal information.\n\nFor privacy questions or requests, contact us at hello@dinebox.sg.'),
  ('terms', 'Terms of Service', E'By using DineBox, you agree to use the platform lawfully and provide accurate information. Restaurant operators remain responsible for the content, offers, and information they publish.\n\nDineBox may update, moderate, or remove content that breaches these terms or applicable law.\n\nIf you have questions about these terms, contact us at hello@dinebox.sg.'),
  ('contact', 'Contact Us', E'We would love to hear from you.\n\nEmail: hello@dinebox.sg\n\nFor restaurant partnerships and business enquiries, please include your restaurant name and contact details.')
ON CONFLICT (slug) DO NOTHING;

ALTER TABLE site_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY public_read_site_pages ON site_pages FOR SELECT
  TO anon, authenticated USING (true);

CREATE POLICY admin_manage_site_pages ON site_pages FOR ALL
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE TABLE IF NOT EXISTS site_settings (
  key text PRIMARY KEY CHECK (key = 'homepage_hero_image_url'),
  value text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO site_settings (key, value)
VALUES ('homepage_hero_image_url', '/dinebox-scan-background.jpeg')
ON CONFLICT (key) DO NOTHING;

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY public_read_site_settings ON site_settings FOR SELECT
  TO anon, authenticated USING (true);

CREATE POLICY admin_manage_site_settings ON site_settings FOR ALL
  TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "admin_upload_site_media" ON storage.objects;
CREATE POLICY "admin_upload_site_media" ON storage.objects FOR ALL
  TO authenticated USING (
    bucket_id = 'restaurant-media' AND public.is_admin()
  ) WITH CHECK (
    bucket_id = 'restaurant-media' AND public.is_admin()
  );
