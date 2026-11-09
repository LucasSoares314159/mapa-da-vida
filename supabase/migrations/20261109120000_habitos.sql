-- Monitor de Hábitos: hábitos e registros diários
--
-- Contexto: a pessoa declara até 5 hábitos ativos, cada um ligado a uma área do
-- Mapa da Vida e com uma meta semanal (1 a 7 vezes). Marcar um hábito grava uma
-- linha por dia; desmarcar apaga a linha.
--
-- Só CREATE neste arquivo: não há dado anterior para migrar.

create table if not exists public.habitos (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users (id) on delete cascade,
  -- 24 caracteres: o nome aparece dentro do círculo da tela Hoje.
  nome          text not null check (char_length(btrim(nome)) between 3 and 24),
  -- Validado na action (ICONES_HABITO em types/index.ts), não no banco: ícone
  -- novo no catálogo não deve exigir migração.
  icone         text not null,
  area          text not null check (area in (
                  'Exercícios Físicos', 'Alimentação', 'Hobbies',
                  'Rede de Apoio', 'Trabalho', 'Finanças',
                  'Propósito', 'Experiências', 'Espiritualidade')),
  meta_semanal  smallint not null check (meta_semanal between 1 and 7),
  -- "Depois de ___": âncora opcional do hábito numa rotina que já existe.
  ancora        text check (ancora is null or char_length(ancora) <= 60),
  -- Posição na grade. null cai no fim, como em objetivos.ordem.
  ordem         integer,
  criado_em     timestamptz not null default now(),
  -- Arquivar tira o hábito da grade, mas o histórico continua contando no
  -- progresso. Por isso não há DELETE para o usuário.
  arquivado_em  timestamptz
);

create index if not exists habitos_user_ativos_idx
  on public.habitos (user_id)
  where arquivado_em is null;

create table if not exists public.habito_registros (
  habito_id  uuid not null references public.habitos (id) on delete cascade,
  user_id    uuid not null references auth.users (id) on delete cascade,
  -- Dia no fuso de Brasília, calculado no servidor (lib/habitos.ts). Em UTC,
  -- marcar às 22h cairia no dia seguinte.
  dia        date not null,
  -- 'pulado' ainda não tem tela; existe para "pular hoje" não exigir migração.
  status     text not null default 'feito' check (status in ('feito', 'pulado')),
  criado_em  timestamptz not null default now(),
  primary key (habito_id, dia)
);

create index if not exists habito_registros_user_dia_idx
  on public.habito_registros (user_id, dia);

alter table public.habitos enable row level security;
alter table public.habito_registros enable row level security;

create policy "Usuário lê seus hábitos"
  on public.habitos for select using (auth.uid() = user_id);
create policy "Usuário cria seus hábitos"
  on public.habitos for insert with check (auth.uid() = user_id);
create policy "Usuário edita seus hábitos"
  on public.habitos for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Usuário lê seus registros de hábito"
  on public.habito_registros for select using (auth.uid() = user_id);
-- O registro só entra se o hábito também for da pessoa: sem isso, um user_id
-- correto com o habito_id de outra conta passaria pela policy.
create policy "Usuário registra seus hábitos"
  on public.habito_registros for insert with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.habitos h
       where h.id = habito_id and h.user_id = auth.uid()
    )
  );
create policy "Usuário apaga seus registros de hábito"
  on public.habito_registros for delete using (auth.uid() = user_id);
