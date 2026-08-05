-- Store uploads beneath the authenticated user's ID. This avoids a cross-table
-- lookup inside Storage RLS while keeping every merchant confined to their own files.
DROP POLICY IF EXISTS "merchant_upload_restaurant_media" ON storage.objects;
DROP POLICY IF EXISTS "merchant_update_restaurant_media" ON storage.objects;
DROP POLICY IF EXISTS "merchant_delete_restaurant_media" ON storage.objects;

CREATE POLICY "merchant_upload_restaurant_media" ON storage.objects FOR INSERT
  TO authenticated WITH CHECK (
    bucket_id = 'restaurant-media'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "merchant_update_restaurant_media" ON storage.objects FOR UPDATE
  TO authenticated USING (
    bucket_id = 'restaurant-media'
    AND (storage.foldername(name))[1] = auth.uid()::text
  ) WITH CHECK (
    bucket_id = 'restaurant-media'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "merchant_delete_restaurant_media" ON storage.objects FOR DELETE
  TO authenticated USING (
    bucket_id = 'restaurant-media'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
