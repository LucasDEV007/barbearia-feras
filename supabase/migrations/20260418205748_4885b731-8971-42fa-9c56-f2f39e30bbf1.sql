
-- =====================================================
-- 1. Remove permissive duplicate INSERT policy on cortes-fotos bucket
-- =====================================================
DROP POLICY IF EXISTS "Authenticated can upload cortes fotos" ON storage.objects;

-- =====================================================
-- 2. Add DELETE policy for agendamentos (owner only)
-- =====================================================
CREATE POLICY "Owner can delete agendamentos"
ON public.agendamentos
FOR DELETE
TO authenticated
USING (public.is_barbershop_owner(auth.uid()));
