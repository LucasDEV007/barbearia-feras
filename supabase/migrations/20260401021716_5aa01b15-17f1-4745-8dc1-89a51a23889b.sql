CREATE POLICY "Anon can read fidelidade_config"
ON public.fidelidade_config
FOR SELECT
TO anon
USING (true);