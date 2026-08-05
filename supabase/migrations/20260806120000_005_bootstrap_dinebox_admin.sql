-- Bootstrap the initial DineBox administrator through the normal, verified
-- Supabase Auth sign-up flow. Change this only through a privileged migration.
CREATE OR REPLACE FUNCTION public.protect_user_roles()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- The Auth trigger is the only intended account-creation path. This
    -- address receives the initial administrator role after email verification.
    IF lower(NEW.email) = 'dineboxsg@gmail.com' THEN
      NEW.role := 'admin';
    ELSIF NOT public.is_admin() THEN
      NEW.role := 'merchant';
    END IF;
  ELSIF NEW.role IS DISTINCT FROM OLD.role AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only an administrator can change account roles';
  END IF;

  RETURN NEW;
END;
$$;

-- Promote the account as well when it was created before this migration ran.
UPDATE public.users
SET role = 'admin'
WHERE lower(email) = 'dineboxsg@gmail.com';

DROP TRIGGER IF EXISTS protect_user_roles ON public.users;
CREATE TRIGGER protect_user_roles
  BEFORE INSERT OR UPDATE OF role ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.protect_user_roles();
