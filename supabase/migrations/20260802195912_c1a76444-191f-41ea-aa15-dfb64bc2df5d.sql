CREATE OR REPLACE FUNCTION public.claim_admin()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
BEGIN
  IF uid IS NULL THEN
    RETURN 'unauthenticated';
  END IF;
  IF EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    IF EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin' AND user_id = uid) THEN
      RETURN 'already_admin';
    END IF;
    RETURN 'admin_exists';
  END IF;
  INSERT INTO public.user_roles (user_id, role) VALUES (uid, 'admin')
  ON CONFLICT DO NOTHING;
  RETURN 'granted';
END;
$$;

REVOKE ALL ON FUNCTION public.claim_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.claim_admin() TO authenticated;