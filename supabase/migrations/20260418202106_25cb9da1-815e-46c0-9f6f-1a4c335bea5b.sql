
-- Apply more permissive but still useful constraints
-- (strict regex rejected legacy rows; use length bounds instead)
ALTER TABLE public.agendamentos
  ADD CONSTRAINT chk_nome_length CHECK (char_length(nome_cliente) BETWEEN 2 AND 100),
  ADD CONSTRAINT chk_telefone_length CHECK (char_length(telefone) BETWEEN 8 AND 30),
  ADD CONSTRAINT chk_estilo_length CHECK (estilo IS NULL OR char_length(estilo) <= 100),
  ADD CONSTRAINT chk_servico_length CHECK (char_length(servico) BETWEEN 1 AND 500),
  ADD CONSTRAINT chk_horario_length CHECK (char_length(horario) BETWEEN 4 AND 10);
