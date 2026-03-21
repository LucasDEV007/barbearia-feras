-- Tabela de agendamentos
CREATE TABLE public.agendamentos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_cliente text NOT NULL,
  telefone text NOT NULL,
  servico text NOT NULL,
  data date NOT NULL,
  horario text NOT NULL,
  status text NOT NULL DEFAULT 'confirmado',
  created_at timestamptz DEFAULT now()
);

-- Impedir dois agendamentos confirmados no mesmo horário
CREATE UNIQUE INDEX idx_unique_agendamento_confirmado 
  ON public.agendamentos (data, horario) WHERE status = 'confirmado';

-- RLS
ALTER TABLE public.agendamentos ENABLE ROW LEVEL SECURITY;

-- Qualquer um pode inserir (cliente)
CREATE POLICY "Clientes podem agendar" ON public.agendamentos FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Qualquer um pode ler (para verificar disponibilidade)
CREATE POLICY "Leitura publica" ON public.agendamentos FOR SELECT TO anon, authenticated USING (true);

-- Apenas autenticados podem atualizar (cancelar)
CREATE POLICY "Admin pode atualizar" ON public.agendamentos FOR UPDATE TO authenticated USING (true) WITH CHECK (true);