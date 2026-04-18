
-- =====================================================
-- 1. Replace is_barbershop_owner: tie to a stable identity (the sole/first auth user),
--    not to self-inserted rows in fidelidade_config.
-- =====================================================
CREATE OR REPLACE FUNCTION public.is_barbershop_owner(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM auth.users
    WHERE id = _user_id
      AND id = (SELECT id FROM auth.users ORDER BY created_at ASC LIMIT 1)
  );
$$;

-- =====================================================
-- 2. FIDELIDADE_CONFIG: tighten policies — only the owner can read/insert/update
-- =====================================================
DROP POLICY IF EXISTS "Authenticated users can read fidelidade_config" ON public.fidelidade_config;
DROP POLICY IF EXISTS "Authenticated users can insert fidelidade_config" ON public.fidelidade_config;
DROP POLICY IF EXISTS "Authenticated users can update fidelidade_config" ON public.fidelidade_config;

CREATE POLICY "Owner can read fidelidade_config"
ON public.fidelidade_config
FOR SELECT
TO authenticated
USING (public.is_barbershop_owner(auth.uid()) AND auth.uid() = user_id);

CREATE POLICY "Owner can insert fidelidade_config"
ON public.fidelidade_config
FOR INSERT
TO authenticated
WITH CHECK (public.is_barbershop_owner(auth.uid()) AND auth.uid() = user_id);

CREATE POLICY "Owner can update fidelidade_config"
ON public.fidelidade_config
FOR UPDATE
TO authenticated
USING (public.is_barbershop_owner(auth.uid()) AND auth.uid() = user_id)
WITH CHECK (public.is_barbershop_owner(auth.uid()) AND auth.uid() = user_id);
