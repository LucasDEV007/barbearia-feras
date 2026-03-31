
-- Fidelity program configuration table
CREATE TABLE public.fidelidade_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ativo boolean NOT NULL DEFAULT false,
  cortes_necessarios integer NOT NULL DEFAULT 5,
  beneficio text NOT NULL DEFAULT '1 corte gratuito',
  user_id uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.fidelidade_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read fidelidade_config" ON public.fidelidade_config
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert fidelidade_config" ON public.fidelidade_config
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can update fidelidade_config" ON public.fidelidade_config
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Client fidelity points tracking table
CREATE TABLE public.fidelidade_pontos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  telefone text NOT NULL,
  nome_cliente text NOT NULL,
  pontos integer NOT NULL DEFAULT 0,
  recompensa_disponivel boolean NOT NULL DEFAULT false,
  recompensas_utilizadas integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(telefone)
);

ALTER TABLE public.fidelidade_pontos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read fidelidade_pontos" ON public.fidelidade_pontos
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert fidelidade_pontos" ON public.fidelidade_pontos
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update fidelidade_pontos" ON public.fidelidade_pontos
  FOR UPDATE TO authenticated USING (true);

-- Public read for clients to check their own points
CREATE POLICY "Public can read own fidelidade_pontos" ON public.fidelidade_pontos
  FOR SELECT TO anon USING (true);
