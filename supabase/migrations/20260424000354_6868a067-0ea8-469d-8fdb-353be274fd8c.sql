-- Create servicos table
CREATE TABLE public.servicos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  preco NUMERIC NOT NULL CHECK (preco >= 0),
  duracao INTEGER NOT NULL CHECK (duracao > 0),
  descricao TEXT NOT NULL DEFAULT '',
  icone TEXT NOT NULL DEFAULT 'Scissors',
  ordem INTEGER NOT NULL DEFAULT 0,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.servicos ENABLE ROW LEVEL SECURITY;

-- Public can read active services (needed for booking page)
CREATE POLICY "Public can read active servicos"
ON public.servicos
FOR SELECT
TO anon, authenticated
USING (ativo = true);

-- Owner can read all
CREATE POLICY "Owner can read all servicos"
ON public.servicos
FOR SELECT
TO authenticated
USING (public.is_barbershop_owner(auth.uid()));

-- Owner can insert
CREATE POLICY "Owner can insert servicos"
ON public.servicos
FOR INSERT
TO authenticated
WITH CHECK (public.is_barbershop_owner(auth.uid()));

-- Owner can update
CREATE POLICY "Owner can update servicos"
ON public.servicos
FOR UPDATE
TO authenticated
USING (public.is_barbershop_owner(auth.uid()))
WITH CHECK (public.is_barbershop_owner(auth.uid()));

-- Owner can delete
CREATE POLICY "Owner can delete servicos"
ON public.servicos
FOR DELETE
TO authenticated
USING (public.is_barbershop_owner(auth.uid()));

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_servicos_updated_at
BEFORE UPDATE ON public.servicos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Seed initial data from current constants
INSERT INTO public.servicos (nome, preco, duracao, descricao, icone, ordem) VALUES
  ('Corte masculino', 30, 30, 'Corte masculino tradicional ou moderno, feito com atenção aos detalhes e acabamento profissional.', 'Scissors', 1),
  ('Barba', 15, 20, 'Modelagem e alinhamento da barba com navalha e máquina para um visual mais limpo.', 'Scissors', 2),
  ('Corte feminino', 35, 30, 'Corte feminino personalizado, respeitando o estilo e preferência da cliente.', 'Sparkles', 3),
  ('Aplicação de tinta', 30, 30, 'Aplicação de coloração para renovar ou mudar o visual do cabelo.', 'Palette', 4),
  ('Reflexo', 70, 120, 'Técnica de iluminação do cabelo que cria reflexos naturais e modernos.', 'Sparkles', 5),
  ('Nevou / Platinado', 100, 130, 'Processo de descoloração para alcançar o efeito platinado ou nevado.', 'Snowflake', 6),
  ('Pigmentação', 15, 20, 'Aplicação de pigmento para reforçar ou restaurar a cor do cabelo ou barba.', 'Droplet', 7),
  ('Alisamento térmico', 70, 100, 'Procedimento para reduzir o volume e deixar o cabelo mais liso.', 'Flame', 8),
  ('Sobrancelha unissex', 10, 10, 'Limpeza e modelagem da sobrancelha para melhorar o visual.', 'Eye', 9);