# Supabase Migration: Tabela Rotinas

Para completar a implementação da Calculadora de Rotina, execute o seguinte SQL no Supabase SQL Editor:

## Passo 1: Acesse o Supabase Dashboard
- Vá para https://supabase.com/dashboard
- Selecione o projeto "Mapa da Vida"
- Vá para a aba "SQL Editor"

## Passo 2: Execute o SQL abaixo

```sql
-- Create rotinas table
create table if not exists public.rotinas (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  mapa_id uuid references public.mapas(id) on delete set null,
  horas_sono numeric not null default 8,
  horas_trabalho numeric not null default 8,
  horas_basicas numeric not null default 4,
  dias_trabalho integer not null default 5,
  percentual_livre integer not null default 40,
  atualizado_em timestamp with time zone not null default now(),
  unique(user_id)
);

-- Create index for faster queries
create index if not exists idx_rotinas_user_id on public.rotinas(user_id);
create index if not exists idx_rotinas_mapa_id on public.rotinas(mapa_id);

-- Enable RLS
alter table public.rotinas enable row level security;

-- RLS policies
create policy "Users can view their own rotinas"
  on public.rotinas for select
  using (auth.uid() = user_id);

create policy "Users can insert their own rotinas"
  on public.rotinas for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own rotinas"
  on public.rotinas for update
  using (auth.uid() = user_id);

create policy "Users can delete their own rotinas"
  on public.rotinas for delete
  using (auth.uid() = user_id);
```

## Passo 3: Após criar a tabela, teste o fluxo completo

1. Acesse http://localhost:3001/dashboard
2. Crie um novo mapa (botão "+ Novo Mapa")
3. Preencha o questionário
4. Você será redirecionado automaticamente para `/rotina?mapaId=[id]`
5. Ajuste os sliders da calculadora
6. Clique "Salvar rotina" e será redirecionado para o diagnóstico
7. Verifique se o resumo da rotina aparece no topo do diagnóstico

## Passo 4: Teste uso independente

1. No sidebar, clique em "Minha Rotina"
2. A calculadora deve carregar com os valores já salvos
3. Você terá a opção de vincular a um mapa existente
4. Ou criar um novo mapa

## Notas

- A tabela `rotinas` está configurada para upsert por `user_id` (uma rotina por usuário)
- O campo `mapa_id` é opcional e permite associar a rotina a um diagnóstico específico
- Todas as operações estão protegidas com RLS (Row Level Security)
- O percentual livre é calculado e salvo automaticamente para performance
