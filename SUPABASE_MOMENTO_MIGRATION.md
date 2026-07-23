# Migração: Momento de Vida

Execute este SQL no Supabase SQL Editor (Dashboard → SQL Editor → New Query):

```sql
-- Tabela de Momentos de Vida
-- A camada de intenção que guia objetivos, rotina e mapa.
CREATE TABLE public.momentos_vida (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  estacao text NOT NULL CHECK (estacao IN ('semear', 'construir', 'consolidar', 'recuperar', 'transicao')),
  frase text NOT NULL,
  duracao text NOT NULL CHECK (duracao IN ('3_meses', '6_meses', '1_ano')),
  data_revisao date NOT NULL,
  ativo boolean NOT NULL DEFAULT true,
  ultimo_lembrete_em timestamptz,
  criado_em timestamptz NOT NULL DEFAULT now()
);

-- Índice para buscar rápido o momento ativo de um usuário
CREATE INDEX idx_momentos_user_ativo ON public.momentos_vida (user_id, ativo);

-- Garante no máximo um momento ativo por usuário
CREATE UNIQUE INDEX idx_momentos_um_ativo ON public.momentos_vida (user_id) WHERE ativo = true;

-- Row Level Security
ALTER TABLE public.momentos_vida ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuário lê seus próprios momentos"
  ON public.momentos_vida FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuário cria seus próprios momentos"
  ON public.momentos_vida FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuário atualiza seus próprios momentos"
  ON public.momentos_vida FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Usuário apaga seus próprios momentos"
  ON public.momentos_vida FOR DELETE
  USING (auth.uid() = user_id);
```

## O que faz

Cria a tabela `momentos_vida`, que armazena a **declaração de momento de vida** do usuário — a fase que ele está vivendo, que serve de princípio para os objetivos, a rotina e o mapa.

Cada registro guarda:
- **estacao** — o arquétipo da fase: `semear`, `construir`, `consolidar`, `recuperar` ou `transicao`
- **frase** — a linha pessoal do usuário (ex: "diminuir o ritmo e focar na saúde")
- **duracao** — quanto tempo o momento deve durar: `3_meses`, `6_meses` ou `1_ano`
- **data_revisao** — data calculada (criação + duração); guia os lembretes de revisão
- **ativo** — apenas um momento fica ativo por vez; ao definir um novo, o anterior é desativado e vira **histórico**
- **ultimo_lembrete_em** — controla o envio de lembretes de revisão por email

O índice único parcial (`idx_momentos_um_ativo`) garante, no banco, que cada usuário tenha no máximo um momento ativo. Os momentos anteriores permanecem na tabela (`ativo = false`) para formar o histórico de fases ao longo do tempo.
