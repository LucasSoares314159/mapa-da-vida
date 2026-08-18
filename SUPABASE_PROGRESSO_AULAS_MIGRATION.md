# Migração: Progresso de Aulas com Data

Substitui o array sobrescrito `profiles.aulas_concluidas` por uma tabela de
eventos com timestamp por aula. A partir daqui, toda conclusão registra **quando**
aconteceu — o que destrava velocidade da trilha, dias travado, drop-off e coorte.

Execute no Supabase SQL Editor (Dashboard → SQL Editor → New Query).

## SQL

```sql
-- Uma linha por aula concluída, com data.
CREATE TABLE public.progresso_aulas (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  modulo_id    text NOT NULL,               -- 'modulo-0' … 'modulo-8'
  concluido_em timestamptz NOT NULL DEFAULT now(),
  -- true = data real (registrada no clique)
  -- false = data estimada na migração do array antigo
  data_confiavel boolean NOT NULL DEFAULT true,
  UNIQUE (user_id, modulo_id)               -- reconcluir não duplica
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

-- Migra o array existente (16 marcações da Turma 1).
-- Sem data real: usa a data de cadastro e marca data_confiavel = false,
-- para que essas linhas fiquem fora das métricas de tempo.
INSERT INTO public.progresso_aulas (user_id, modulo_id, concluido_em, data_confiavel)
SELECT p.id,
       'modulo-' || idx::text,
       COALESCE(p.criado_em, now()),
       false
FROM public.profiles p,
     unnest(p.aulas_concluidas) AS idx
WHERE p.aulas_concluidas IS NOT NULL
ON CONFLICT (user_id, modulo_id) DO NOTHING;
```

## Verificação

```sql
-- Deve retornar 16 linhas, todas com data_confiavel = false.
SELECT data_confiavel, count(*) FROM public.progresso_aulas GROUP BY 1;
```

## Por que a coluna `data_confiavel`

A Turma 1 (5 pessoas, 16 marcações) já concluiu aulas sem que a data fosse
gravada — esse histórico é irrecuperável. Se essas linhas entrassem com a data de
cadastro como se fosse real, elas contaminariam as médias de velocidade: a pessoa
que concluiu 7 módulos apareceria como tendo feito tudo no mesmo segundo.

A flag isola esse ruído. As métricas de tempo filtram `data_confiavel = true`;
as de contagem (quantos concluíram o quê) usam tudo.

**A Turma 2 nasce inteira com data real** — os 4 cadastros de 17/08 estão com
`aulas_concluidas` vazio, então nenhuma conclusão dessa turma se perde.

## Sobre `profiles.aulas_concluidas`

A coluna permanece durante a transição e deixa de ser escrita. Só remover depois
que o back office estiver rodando e os números baterem:

```sql
-- Rodar só após validação, não agora.
-- ALTER TABLE public.profiles DROP COLUMN aulas_concluidas;
```
