-- Migração: Progresso de Aulas com Data
-- Cole ESTE arquivo inteiro no Supabase SQL Editor e rode.

CREATE TABLE public.progresso_aulas (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  modulo_id      text NOT NULL,
  concluido_em   timestamptz NOT NULL DEFAULT now(),
  data_confiavel boolean NOT NULL DEFAULT true,
  UNIQUE (user_id, modulo_id)
);

CREATE INDEX idx_progresso_user ON public.progresso_aulas (user_id);
CREATE INDEX idx_progresso_data ON public.progresso_aulas (concluido_em);

ALTER TABLE public.progresso_aulas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuário lê seu próprio progresso"
  ON public.progresso_aulas FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuário grava seu próprio progresso"
  ON public.progresso_aulas FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuário apaga seu próprio progresso"
  ON public.progresso_aulas FOR DELETE USING (auth.uid() = user_id);

INSERT INTO public.progresso_aulas (user_id, modulo_id, concluido_em, data_confiavel)
SELECT p.id,
       'modulo-' || idx::text,
       COALESCE(p.criado_em, now()),
       false
FROM public.profiles p,
     unnest(p.aulas_concluidas) AS idx
WHERE p.aulas_concluidas IS NOT NULL
ON CONFLICT (user_id, modulo_id) DO NOTHING;
