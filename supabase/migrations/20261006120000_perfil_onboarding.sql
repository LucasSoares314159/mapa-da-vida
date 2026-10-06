-- Perfil coletado no onboarding do Mapa da Vida.
-- Colunas nullable de propósito: os perfis que já existem não têm esses dados e
-- preenchê-los com valor estimado criaria informação falsa de segmentação.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS data_nascimento date,
  ADD COLUMN IF NOT EXISTS profissao text,
  ADD COLUMN IF NOT EXISTS profissao_outro text;

COMMENT ON COLUMN public.profiles.data_nascimento IS
  'Coletada uma única vez no onboarding do Mapa; usada para follow-up de mentoria.';

COMMENT ON COLUMN public.profiles.profissao IS
  'Grupo de ICP escolhido no onboarding. Quando = ''Outro'', o texto livre fica em profissao_outro.';

COMMENT ON COLUMN public.profiles.profissao_outro IS
  'Texto livre informado quando profissao = ''Outro''. Nulo nos demais casos.';
