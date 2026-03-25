-- Tabela despesas
CREATE TABLE public.despesas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  descricao text NOT NULL,
  valor numeric NOT NULL,
  vencimento date NOT NULL,
  categoria text NOT NULL DEFAULT 'outros',
  pago boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL
);

ALTER TABLE public.despesas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read despesas"
  ON public.despesas FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert despesas"
  ON public.despesas FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can update despesas"
  ON public.despesas FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can delete despesas"
  ON public.despesas FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Tabela mensagem_templates
CREATE TABLE public.mensagem_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo text NOT NULL,
  conteudo text NOT NULL,
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.mensagem_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage templates"
  ON public.mensagem_templates FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- Tabela mensagens_enviadas
CREATE TABLE public.mensagens_enviadas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agendamento_id uuid REFERENCES public.agendamentos(id) ON DELETE CASCADE NOT NULL,
  tipo text NOT NULL,
  enviado_em timestamptz DEFAULT now()
);

ALTER TABLE public.mensagens_enviadas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read mensagens"
  ON public.mensagens_enviadas FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Service can insert mensagens"
  ON public.mensagens_enviadas FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE UNIQUE INDEX idx_mensagens_unicas ON public.mensagens_enviadas (agendamento_id, tipo);