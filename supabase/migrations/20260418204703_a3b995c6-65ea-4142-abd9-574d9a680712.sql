
DROP POLICY IF EXISTS "Service can insert mensagens" ON public.mensagens_enviadas;

CREATE POLICY "Owner can insert mensagens enviadas"
ON public.mensagens_enviadas
FOR INSERT
TO authenticated
WITH CHECK (public.is_barbershop_owner(auth.uid()));
