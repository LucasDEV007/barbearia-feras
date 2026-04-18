
-- =====================================================
-- 1. Create roles enum and user_roles table
-- =====================================================
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('barbeiro');
EXCEPTION WHEN duplicate_object THEN null; END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Users can read their own roles, but no one can self-insert/update/delete via RLS
CREATE POLICY "Users can read own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- =====================================================
-- 2. Replace has_role / is_barbershop_owner with stable role-based check
-- =====================================================
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  );
$$;

CREATE OR REPLACE FUNCTION public.is_barbershop_owner(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(_user_id, 'barbeiro'::public.app_role);
$$;

-- =====================================================
-- 3. Backfill the existing barbershop account with the 'barbeiro' role
--    (single-barber system: grant role to all existing auth users — there's at most one)
-- =====================================================
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'barbeiro'::public.app_role FROM auth.users
ON CONFLICT (user_id, role) DO NOTHING;

-- =====================================================
-- 4. Defense-in-depth on fidelidade_pontos: keep owner check
--    (the underlying owner function is now stable)
-- =====================================================
-- Policies already reference is_barbershop_owner — no change needed here, but make sure
-- they exist (they were created in earlier migrations).

-- =====================================================
-- 5. Storage: scope cortes-fotos modifications to the original uploader
--    Path convention enforced: <user_id>/<filename>
-- =====================================================
DROP POLICY IF EXISTS "Authenticated can insert cortes fotos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can delete cortes fotos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can update cortes fotos" ON storage.objects;

CREATE POLICY "Owner can insert own cortes fotos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'cortes-fotos'
  AND public.is_barbershop_owner(auth.uid())
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Owner can update own cortes fotos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'cortes-fotos'
  AND public.is_barbershop_owner(auth.uid())
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Owner can delete own cortes fotos"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'cortes-fotos'
  AND public.is_barbershop_owner(auth.uid())
  AND (storage.foldername(name))[1] = auth.uid()::text
);
