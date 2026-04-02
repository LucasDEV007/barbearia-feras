
-- Storage bucket for cut photos
INSERT INTO storage.buckets (id, name, public) VALUES ('cortes-fotos', 'cortes-fotos', true);

-- Storage policies
CREATE POLICY "Public can view cortes fotos" ON storage.objects FOR SELECT USING (bucket_id = 'cortes-fotos');
CREATE POLICY "Authenticated can upload cortes fotos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'cortes-fotos' AND auth.role() = 'authenticated');
CREATE POLICY "Authenticated can delete cortes fotos" ON storage.objects FOR DELETE USING (bucket_id = 'cortes-fotos' AND auth.role() = 'authenticated');

-- Table for recent cuts
CREATE TABLE public.cortes_recentes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  imagem_url TEXT NOT NULL,
  estilo TEXT,
  descricao TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.cortes_recentes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view cortes recentes" ON public.cortes_recentes FOR SELECT USING (true);
CREATE POLICY "Authenticated can insert cortes recentes" ON public.cortes_recentes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Authenticated can delete cortes recentes" ON public.cortes_recentes FOR DELETE USING (auth.uid() = user_id);

-- Config table
CREATE TABLE public.cortes_recentes_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  ativo BOOLEAN NOT NULL DEFAULT false,
  limite INTEGER NOT NULL DEFAULT 6,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.cortes_recentes_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read cortes recentes config" ON public.cortes_recentes_config FOR SELECT USING (true);
CREATE POLICY "Authenticated can insert cortes recentes config" ON public.cortes_recentes_config FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Authenticated can update cortes recentes config" ON public.cortes_recentes_config FOR UPDATE USING (auth.uid() = user_id);
