# Migração: Progresso de Aulas

Execute este SQL no Supabase SQL Editor (Dashboard → SQL Editor → New Query):

```sql
ALTER TABLE public.profiles
ADD COLUMN aulas_concluidas INTEGER[] DEFAULT '{}';
```

## O que faz

Adiciona uma coluna `aulas_concluidas` na tabela `profiles` que armazena um array de inteiros representando os índices (0-based) dos módulos da Trilha da Produtividade que o usuário já concluiu.

Exemplo: `{0, 2, 5}` significa que o usuário concluiu os módulos de índice 0, 2 e 5.
