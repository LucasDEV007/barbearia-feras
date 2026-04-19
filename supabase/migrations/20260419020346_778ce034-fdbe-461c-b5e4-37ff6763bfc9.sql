-- Add DELETE policy on fidelidade_pontos so owner can remove stale loyalty records
CREATE POLICY "Owner can delete fidelidade_pontos"
ON public.fidelidade_pontos
FOR DELETE
TO authenticated
USING (is_barbershop_owner(auth.uid()));