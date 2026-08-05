-- Allow authenticated DineBox administrators to operate the management portal.
-- The helper is SECURITY DEFINER so it can safely check the users table while RLS is enabled.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- All portal-managed data remains protected for everyone except authenticated admins.
DO $$
DECLARE
  managed_table text;
BEGIN
  FOREACH managed_table IN ARRAY ARRAY[
    'users', 'restaurants', 'posts', 'deals', 'menu_categories', 'menu_items',
    'reviews', 'awards', 'followers', 'analytics_events', 'ranking_scores',
    'notifications', 'scoring_weights'
  ]
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS admin_manage_all ON public.%I', managed_table);
    EXECUTE format(
      'CREATE POLICY admin_manage_all ON public.%I FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin())',
      managed_table
    );
  END LOOP;
END $$;
