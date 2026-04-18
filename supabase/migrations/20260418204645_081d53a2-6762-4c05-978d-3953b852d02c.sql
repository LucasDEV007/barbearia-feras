
-- =====================================================
-- 1. AGENDAMENTOS: scope UPDATE to barbershop owner only
-- =====================================================
DROP POLICY IF EXISTS "Admin pode atualizar" ON public.agendamentos;

CREATE POLICY "Owner can update agendamentos"
ON public.agendamentos
FOR UPDATE
TO authenticated
USING (public.is_barbershop_owner(auth.uid()))
WITH CHECK (public.is_barbershop_owner(auth.uid()));

-- Also tighten SELECT to owner only (it was authenticated USING true)
DROP POLICY IF EXISTS "Authenticated can read agendamentos" ON public.agendamentos;

CREATE POLICY "Owner can read agendamentos"
ON public.agendamentos
FOR SELECT
TO authenticated
USING (public.is_barbershop_owner(auth.uid()));

-- =====================================================
-- 2. MENSAGEM_TEMPLATES: scope ALL ops to barbershop owner only
-- =====================================================
DROP POLICY IF EXISTS "Authenticated users can manage templates" ON public.mensagem_templates;

CREATE POLICY "Owner can read templates"
ON public.mensagem_templates
FOR SELECT
TO authenticated
USING (public.is_barbershop_owner(auth.uid()));

CREATE POLICY "Owner can insert templates"
ON public.mensagem_templates
FOR INSERT
TO authenticated
WITH CHECK (public.is_barbershop_owner(auth.uid()));

CREATE POLICY "Owner can update templates"
ON public.mensagem_templates
FOR UPDATE
TO authenticated
USING (public.is_barbershop_owner(auth.uid()))
WITH CHECK (public.is_barbershop_owner(auth.uid()));

CREATE POLICY "Owner can delete templates"
ON public.mensagem_templates
FOR DELETE
TO authenticated
USING (public.is_barbershop_owner(auth.uid()));

-- =====================================================
-- 3. MENSAGENS_ENVIADAS: scope SELECT to owner
-- =====================================================
DROP POLICY IF EXISTS "Authenticated users can read mensagens" ON public.mensagens_enviadas;

CREATE POLICY "Owner can read mensagens enviadas"
ON public.mensagens_enviadas
FOR SELECT
TO authenticated
USING (public.is_barbershop_owner(auth.uid()));

-- =====================================================
-- 4. Reduce PII exposure in public phone-lookup RPCs
-- =====================================================

-- Recreate get_agendamentos_by_telefone with minimal columns (no beneficio_aplicado, no created_at)
DROP FUNCTION IF EXISTS public.get_agendamentos_by_telefone(text);

CREATE OR REPLACE FUNCTION public.get_agendamentos_by_telefone(p_telefone text)
RETURNS TABLE (
  id uuid,
  nome_cliente text,
  telefone text,
  servico text,
  estilo text,
  data date,
  horario text,
  status text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, nome_cliente, telefone, servico, estilo, data, horario, status
  FROM public.agendamentos
  WHERE telefone = p_telefone;
$$;
GRANT EXECUTE ON FUNCTION public.get_agendamentos_by_telefone(text) TO anon, authenticated;

-- Recreate get_pontos_by_telefone with minimal columns
DROP FUNCTION IF EXISTS public.get_pontos_by_telefone(text);

CREATE OR REPLACE FUNCTION public.get_pontos_by_telefone(p_telefone text)
RETURNS TABLE (
  id uuid,
  pontos integer,
  recompensa_disponivel boolean,
  recompensas_utilizadas integer
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, pontos, recompensa_disponivel, recompensas_utilizadas
  FROM public.fidelidade_pontos
  WHERE telefone = p_telefone;
$$;
GRANT EXECUTE ON FUNCTION public.get_pontos_by_telefone(text) TO anon, authenticated;
