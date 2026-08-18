-- Marca contas internas (testes, equipe) para que fiquem fora das métricas
-- do back office sem perder nenhum dado nem mudar a experiência de quem usa.
--
-- Cole este arquivo INTEIRO no Supabase SQL Editor e rode de uma vez.

-- 1) Cria a coluna.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS excluir_das_metricas boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.profiles.excluir_das_metricas IS
  'true = conta interna; o back office ignora, mas a plataforma funciona normalmente.';

-- 2) Marca a conta interna do Lucas.
UPDATE public.profiles
SET excluir_das_metricas = true
WHERE nome ILIKE '%Lucas Teste%';

-- 3) Confere o resultado.
SELECT nome, criado_em, excluir_das_metricas
FROM public.profiles
ORDER BY excluir_das_metricas DESC, criado_em;
