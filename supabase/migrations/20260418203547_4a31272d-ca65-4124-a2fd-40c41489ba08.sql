
-- =====================================================
-- 1. FIDELIDADE_PONTOS: Restrict access to barbershop owner only
-- =====================================================
DROP POLICY IF EXISTS "Authenticated users can read fidelidade_pontos" ON public.fidelidade_pontos;
DROP POLICY IF EXISTS "Authenticated users can insert fidelidade_pontos" ON public.fidelidade_pontos;
DROP POLICY IF EXISTS "Authenticated users can update fidelidade_pontos" ON public.fidelidade_pontos;

-- Helper: only allow access if the user owns a fidelidade_config row (i.e. is the barbershop owner)
CREATE OR REPLACE FUNCTION public.is_barbershop_owner(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.fidelidade_config WHERE user_id = _user_id
  );
$$;

CREATE POLICY "Owner can read fidelidade_pontos"
ON public.fidelidade_pontos
FOR SELECT
TO authenticated
USING (public.is_barbershop_owner(auth.uid()));

CREATE POLICY "Owner can insert fidelidade_pontos"
ON public.fidelidade_pontos
FOR INSERT
TO authenticated
WITH CHECK (public.is_barbershop_owner(auth.uid()));

CREATE POLICY "Owner can update fidelidade_pontos"
ON public.fidelidade_pontos
FOR UPDATE
TO authenticated
USING (public.is_barbershop_owner(auth.uid()));

-- =====================================================
-- 2. FIDELIDADE_CONFIG: Remove anon SELECT, expose minimal fields via RPC
-- =====================================================
DROP POLICY IF EXISTS "Anon can read fidelidade_config" ON public.fidelidade_config;

CREATE OR REPLACE FUNCTION public.get_fidelidade_config_publica()
RETURNS TABLE (ativo boolean, cortes_necessarios integer, beneficio text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT ativo, cortes_necessarios, beneficio
  FROM public.fidelidade_config
  WHERE ativo = true
  LIMIT 1;
$$;
GRANT EXECUTE ON FUNCTION public.get_fidelidade_config_publica() TO anon, authenticated;
