-- Conteúdo escrito dos módulos (substitui o link externo para o Notion).
--
-- Cole este arquivo INTEIRO no Supabase SQL Editor e rode de uma vez.

-- 1) Tabela de conteúdo. Chave é o mesmo texto usado em progresso_aulas.modulo_id
--    ('modulo-0'..'modulo-8'), sem FK porque lib/modulos.ts continua sendo a
--    fonte dos metadados (título, duração, vídeo) — só o texto migra pro banco.
CREATE TABLE IF NOT EXISTS public.modulos_conteudo (
  modulo_id     text PRIMARY KEY,
  blocos        jsonb NOT NULL DEFAULT '[]'::jsonb,
  atualizado_em timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.modulos_conteudo IS
  'Conteúdo escrito de cada módulo, em blocos estruturados. Editado em /admin/modulos.';
COMMENT ON COLUMN public.modulos_conteudo.blocos IS
  'Array de blocos: {tipo: paragrafo|titulo|lista|checklist|callout|destaque|imagem|divisor|citacao, ...}';

-- 2) RLS: qualquer usuário autenticado lê; só a service role (admin) escreve.
ALTER TABLE public.modulos_conteudo ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuário autenticado lê o conteúdo dos módulos"
  ON public.modulos_conteudo FOR SELECT
  USING (auth.role() = 'authenticated');

-- Sem policy de INSERT/UPDATE/DELETE para usuários comuns: a tela de admin
-- escreve via createAdminSupabaseClient (service role), que bypassa RLS.

-- 3) Bucket de imagens do conteúdo — público para leitura, upload só via admin.
INSERT INTO storage.buckets (id, name, public)
VALUES ('modulos-imagens', 'modulos-imagens', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Leitura pública das imagens de módulos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'modulos-imagens');

-- Sem policy de INSERT/UPDATE/DELETE para usuários comuns: upload também
-- passa pela service role a partir da tela de admin.
