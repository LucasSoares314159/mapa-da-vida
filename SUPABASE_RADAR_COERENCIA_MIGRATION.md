# Migração: Radar de Coerência

Execute este SQL no Supabase SQL Editor (Dashboard → SQL Editor → New Query):

```sql
-- Radar de Coerência: duas perguntas obrigatórias respondidas ao criar/editar
-- um objetivo, para revisar se ele nasce do Momento de Vida ou da comparação.
ALTER TABLE public.objetivos
  ADD COLUMN radar_faz_sentido boolean,
  ADD COLUMN radar_por_mim boolean;
```

## O que faz

Adiciona duas colunas à tabela `objetivos` que guardam a resposta do usuário ao **Radar de Coerência**, exibido como etapa final do formulário de criação/edição de objetivo:

- **radar_faz_sentido** — resposta a "Esse objetivo faz sentido com o meu momento de vida?" (`true` = sim, `false` = não)
- **radar_por_mim** — resposta a "Estou fazendo isso por mim ou para outras pessoas?" (`true` = por mim, `false` = para outras pessoas)

Ambas as colunas são obrigatórias na aplicação (a action rejeita `null`), mas ficam nullable no banco para não quebrar objetivos já existentes criados antes da feature.

Quando `radar_faz_sentido = false` ou `radar_por_mim = false`, a interface exibe um selo de alerta no card do objetivo, sinalizando que ele pode ser fruto de comparação — sem impedir o uso do objetivo.
