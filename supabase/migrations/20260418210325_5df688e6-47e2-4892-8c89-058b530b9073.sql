
DROP FUNCTION IF EXISTS public.get_agendamentos_by_telefone(text);

CREATE OR REPLACE FUNCTION public.get_agendamentos_by_telefone(p_telefone text)
RETURNS TABLE (
  id uuid,
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
  SELECT id, servico, estilo, data, horario, status
  FROM public.agendamentos
  WHERE telefone = p_telefone;
$$;
GRANT EXECUTE ON FUNCTION public.get_agendamentos_by_telefone(text) TO anon, authenticated;
