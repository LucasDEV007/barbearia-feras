CREATE TABLE public.bloqueios_agenda (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  data DATE NOT NULL,
  horario TEXT,
  motivo TEXT DEFAULT 'Barbeiro ausente',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.bloqueios_agenda ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read bloqueios" 
ON public.bloqueios_agenda 
FOR SELECT 
TO anon, authenticated
USING (true);

CREATE POLICY "Authenticated can insert bloqueios" 
ON public.bloqueios_agenda 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated can delete bloqueios" 
ON public.bloqueios_agenda 
FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);

CREATE INDEX idx_bloqueios_data ON public.bloqueios_agenda (data);