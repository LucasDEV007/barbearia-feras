-- Public function returning only ativo + limite (no user_id)
CREATE OR REPLACE FUNCTION public.get_cortes_recentes_config_publica()
RETURNS TABLE(
  ativo boolean,
  limite integer
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT ativo, limite
  FROM public.cortes_recentes_config
  WHERE ativo = true
  LIMIT 1;
$function$;

GRANT EXECUTE ON FUNCTION public.get_cortes_recentes_config_publica() TO anon, authenticated;

-- Restrict direct SELECT to owner
DROP POLICY IF EXISTS "Public can read cortes recentes config" ON public.cortes_recentes_config;

CREATE POLICY "Owner can read cortes recentes config"
ON public.cortes_recentes_config
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);
