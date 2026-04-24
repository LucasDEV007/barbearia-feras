-- Add unique constraint on service name (case-insensitive) to prevent duplicates
CREATE UNIQUE INDEX IF NOT EXISTS servicos_nome_unique_idx ON public.servicos (LOWER(nome));