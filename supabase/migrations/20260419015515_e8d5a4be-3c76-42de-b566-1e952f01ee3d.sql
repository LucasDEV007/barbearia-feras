-- 1) Explicit deny policies on user_roles (defense in depth)
CREATE POLICY "No one can insert roles via client"
ON public.user_roles
FOR INSERT
TO authenticated, anon
WITH CHECK (false);

CREATE POLICY "No one can update roles via client"
ON public.user_roles
FOR UPDATE
TO authenticated, anon
USING (false)
WITH CHECK (false);

CREATE POLICY "No one can delete roles via client"
ON public.user_roles
FOR DELETE
TO authenticated, anon
USING (false);

-- 2) Public function returning cortes recentes WITHOUT user_id
CREATE OR REPLACE FUNCTION public.get_cortes_recentes_publicos()
RETURNS TABLE(
  id uuid,
  imagem_url text,
  estilo text,
  descricao text,
  created_at timestamptz
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT cr.id, cr.imagem_url, cr.estilo, cr.descricao, cr.created_at
  FROM public.cortes_recentes cr
  ORDER BY cr.created_at DESC;
$function$;

GRANT EXECUTE ON FUNCTION public.get_cortes_recentes_publicos() TO anon, authenticated;

-- 3) Restrict direct SELECT on cortes_recentes to owner only
DROP POLICY IF EXISTS "Public can view cortes recentes" ON public.cortes_recentes;

CREATE POLICY "Owner can read cortes recentes"
ON public.cortes_recentes
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);
