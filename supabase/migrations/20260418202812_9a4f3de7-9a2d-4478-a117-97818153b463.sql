
-- =====================================================
-- 1. AGENDAMENTOS: Remove public SELECT, add safe RPCs
-- =====================================================
DROP POLICY IF EXISTS "Leitura publica" ON public.agendamentos;

CREATE POLICY "Authenticated can read agendamentos"
ON public.agendamentos
FOR SELECT
TO authenticated
USING (true);

CREATE OR REPLACE FUNCTION public.get_horarios_ocupados(p_data date)
RETURNS TABLE (horario text, servico text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT horario, servico
  FROM public.agendamentos
  WHERE data = p_data AND status = 'confirmado';
$$;
GRANT EXECUTE ON FUNCTION public.get_horarios_ocupados(date) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.get_agendamentos_by_telefone(p_telefone text)
RETURNS SETOF public.agendamentos
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM public.agendamentos WHERE telefone = p_telefone;
$$;
GRANT EXECUTE ON FUNCTION public.get_agendamentos_by_telefone(text) TO anon, authenticated;

-- =====================================================
-- 2. AGENDAMENTOS: Restrict anon INSERT (no benefit flag, no arbitrary status)
-- =====================================================
DROP POLICY IF EXISTS "Clientes podem agendar" ON public.agendamentos;

CREATE POLICY "Clientes podem agendar"
ON public.agendamentos
FOR INSERT
TO anon, authenticated
WITH CHECK (
  beneficio_aplicado = false
  AND status = 'confirmado'
  AND char_length(nome_cliente) BETWEEN 2 AND 100
  AND char_length(telefone) BETWEEN 8 AND 30
  AND char_length(servico) BETWEEN 1 AND 500
  AND char_length(horario) BETWEEN 4 AND 10
  AND (estilo IS NULL OR char_length(estilo) <= 100)
);

-- =====================================================
-- 3. DESPESAS: Restrict SELECT to owner only
-- =====================================================
DROP POLICY IF EXISTS "Authenticated users can read despesas" ON public.despesas;

CREATE POLICY "Users can read own despesas"
ON public.despesas
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- =====================================================
-- 4. FIDELIDADE_PONTOS: Remove anon SELECT, add RPC
-- =====================================================
DROP POLICY IF EXISTS "Public can read own fidelidade_pontos" ON public.fidelidade_pontos;

CREATE OR REPLACE FUNCTION public.get_pontos_by_telefone(p_telefone text)
RETURNS SETOF public.fidelidade_pontos
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM public.fidelidade_pontos WHERE telefone = p_telefone;
$$;
GRANT EXECUTE ON FUNCTION public.get_pontos_by_telefone(text) TO anon, authenticated;

-- =====================================================
-- 5. STORAGE: Remove broad listing policy
-- =====================================================
DROP POLICY IF EXISTS "Public can view cortes fotos" ON storage.objects;
