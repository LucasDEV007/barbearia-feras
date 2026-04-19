-- 1) Drop and recreate RPC with extra columns (nome_cliente, telefone)
DROP FUNCTION IF EXISTS public.get_agendamentos_by_telefone(text);

CREATE OR REPLACE FUNCTION public.get_agendamentos_by_telefone(p_telefone text)
RETURNS TABLE(
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
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT id, nome_cliente, telefone, servico, estilo, data, horario, status
  FROM public.agendamentos
  WHERE telefone = p_telefone;
$function$;

-- 2) New RPC: client cancels own appointment, only if phone matches and date is future
CREATE OR REPLACE FUNCTION public.cancelar_agendamento_by_telefone(
  p_id uuid,
  p_telefone text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_updated int;
BEGIN
  UPDATE public.agendamentos
  SET status = 'cancelado'
  WHERE id = p_id
    AND telefone = p_telefone
    AND status = 'confirmado'
    AND data >= CURRENT_DATE;

  GET DIAGNOSTICS v_updated = ROW_COUNT;
  RETURN v_updated > 0;
END;
$function$;

GRANT EXECUTE ON FUNCTION public.cancelar_agendamento_by_telefone(uuid, text) TO anon, authenticated;
