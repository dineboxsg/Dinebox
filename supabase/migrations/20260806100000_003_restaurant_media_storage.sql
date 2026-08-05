-- Merchant-uploaded images for restaurant profiles and content.
INSERT INTO storage.buckets (id, name, public)
VALUES ('restaurant-media', 'restaurant-media', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "public_read_restaurant_media" ON storage.objects;
CREATE POLICY "public_read_restaurant_media" ON storage.objects FOR SELECT
  TO anon, authenticated USING (bucket_id = 'restaurant-media');

DROP POLICY IF EXISTS "merchant_upload_restaurant_media" ON storage.objects;
CREATE POLICY "merchant_upload_restaurant_media" ON storage.objects FOR INSERT
  TO authenticated WITH CHECK (
    bucket_id = 'restaurant-media'
    AND EXISTS (
      SELECT 1 FROM restaurants
      WHERE restaurants.id = ((storage.foldername(name))[1])::uuid
        AND restaurants.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "merchant_update_restaurant_media" ON storage.objects;
CREATE POLICY "merchant_update_restaurant_media" ON storage.objects FOR UPDATE
  TO authenticated USING (
    bucket_id = 'restaurant-media'
    AND EXISTS (
      SELECT 1 FROM restaurants
      WHERE restaurants.id = ((storage.foldername(name))[1])::uuid
        AND restaurants.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "merchant_delete_restaurant_media" ON storage.objects;
CREATE POLICY "merchant_delete_restaurant_media" ON storage.objects FOR DELETE
  TO authenticated USING (
    bucket_id = 'restaurant-media'
    AND EXISTS (
      SELECT 1 FROM restaurants
      WHERE restaurants.id = ((storage.foldername(name))[1])::uuid
        AND restaurants.owner_id = auth.uid()
    )
  );
