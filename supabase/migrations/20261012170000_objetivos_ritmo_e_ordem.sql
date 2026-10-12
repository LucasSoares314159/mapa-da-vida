-- Objetivos: ritmo declarado e ordem manual
--
-- Contexto: a tela de Objetivos passou a permitir que a pessoa (a) declare se cada
-- objetivo está andando e (b) defina a ordem dos cards dentro de cada aba de prazo.
--
-- ALTER antes de qualquer UPDATE no mesmo arquivo (convenção do projeto).

-- Ritmo declarado pela PESSOA, não calculado pelo prazo. Nullable de propósito:
-- NULL significa "ainda não declarou", que é diferente de "está parado" — os
-- objetivos anteriores à feature ficam nulos, porque preenchê-los com estimativa
-- inventaria uma declaração que ninguém fez. Mesmo padrão do Radar de Coerência
-- e de profiles.data_nascimento.
alter table public.objetivos
  add column if not exists ritmo text
  check (ritmo in ('avancando', 'travado', 'parado'));

-- Posição manual dentro do grupo (user_id, prazo). A ordem é por aba porque as
-- três listas nunca aparecem juntas na tela: uma ordem global seria invisível.
-- Nullable: sem ordem, o objetivo cai no fim da lista (criado_em desc, como antes).
alter table public.objetivos
  add column if not exists ordem integer;

-- Semeia a ordem vigente (criado_em desc) por usuário e prazo, para a lista não
-- embaralhar no primeiro load depois do deploy.
with numerados as (
  select id,
         row_number() over (
           partition by user_id, prazo
           order by criado_em desc
         ) - 1 as pos
    from public.objetivos
   where status <> 'arquivado'
)
update public.objetivos o
   set ordem = n.pos
  from numerados n
 where o.id = n.id
   and o.ordem is null;

create index if not exists objetivos_ordem_idx
  on public.objetivos (user_id, prazo, ordem);
