# Mapa da Vida — CLAUDE.md

> **Como manter este arquivo:** ele descreve o que o código **não** diz por si só —
> decisões, invariantes e armadilhas. Não duplique o que se lê na fonte: aponte para
> ela. Ao terminar uma feature, rode o checklist em [Manutenção deste arquivo](#manutenção-deste-arquivo).

---

## Produto

**Trilha da Produtividade** (MindTrail) é um programa pago que ensina a pessoa a
construir seu próprio sistema de organização pessoal. São 9 módulos e lives.

O **Mapa da Vida** é o Módulo 3 e o AHA moment: um diagnóstico reflexivo em que a
pessoa classifica 9 áreas da vida como verde/amarelo/vermelho e recebe um
fluxograma com análise. O choque de realidade motiva a mudança.

A plataforma web hospeda a trilha e quatro ferramentas que a acompanham: **Mapa**,
**Momento de Vida**, **Objetivos** e **Calculadora de Rotina**. O conteúdo em si
(vídeos e materiais) vive no **YouTube e no Notion** — a plataforma referencia, não
hospeda. Isso importa em qualquer discussão de métricas de engajamento.

### Turmas

| Turma | Cadastros | Particularidade |
|---|---|---|
| Turma 1 | até julho/2026 | progresso migrado **sem data real** |
| Turma 2 | de 17/08/2026 | nasceu com registro de data |

`profiles` contém **apenas quem pagou** — 13 pessoas. Há ~47 contas em `auth.users`
sem perfil: resíduo da época em que o Mapa era um produto aberto e gratuito, cujos
perfis foram deletados de propósito. **Nunca reconciliar `auth.users` com
`profiles`** — isso reintroduziria não-clientes nas métricas.

---

## Ambiente

- **Pasta:** `/Users/danilo/Documents/mapa-da-vida`
- **Porta:** `3001` (`npm run dev`)
- **Node.js:** v22.x — v24 é incompatível
- **Preview de e-mails:** `npm run email` (porta 3002)
- **Processos travados:** `pkill -9 -f "next dev"`
- **macOS bloqueando o servidor:** `xattr -cr .` (já roda no `postinstall`)
- O aviso `Found lockfile missing swc dependencies` no boot é cosmético; ignore.

### Antes de qualquer push

```bash
npx tsc --noEmit          # tipos
npx next lint             # ESLint — o build da Vercel FALHA em erros de lint
npm run build             # só com o dev parado
```

`tsc` sozinho **não** basta: já quebrou um deploy por erros de ESLint que ele não vê.

---

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 14.2.35 (App Router) |
| Linguagem | TypeScript |
| Estilo | Tailwind CSS v3 + shadcn/ui |
| Ícones | Lucide React |
| Formulários | react-hook-form + Zod |
| Fluxograma | @xyflow/react |
| Gráficos | Recharts |
| Animação | motion |
| Banco / Auth | Supabase (PostgreSQL) |
| E-mail | react-email + nodemailer (SMTP) |
| Hospedagem | Vercel |

### Next.js 14 — diferenças que causam erro

- `params` é **síncrono** (não `await params`)
- `cookies()` **não** é async
- `useFormState` de `react-dom` (não `useActionState`)
- `middleware.ts` na raiz (não `proxy.ts`, que é Next 16+)

---

## Rotas

| Rota | Descrição | Auth |
|---|---|---|
| `/` | Landing page | pública |
| `/lista-espera`, `/obrigado` | Captação e agradecimento | pública |
| `/auth/*` | login, cadastro, esqueci/redefinir senha, verificar e-mail, callback | pública |
| `/content` | Trilha: módulos e lives | ✅ |
| `/content/modulo/[id]`, `/content/live/[id]` | Aula individual | ✅ |
| `/mapa/preparacao` → `/mapa/novo` → `/mapa/[id]` | Fluxo do AHA moment | ✅ |
| `/diagnostico/[id]` | Diagnóstico completo | ✅ |
| `/momento` | Momento de Vida | ✅ (guarda própria) |
| `/objetivos` | Objetivos + Radar de Coerência | ✅ |
| `/rotina` | Calculadora de Rotina | ✅ |
| `/dashboard` | Mapas salvos e evolução | ✅ |
| `/admin` | Back office de métricas | ✅ + `ADMIN_EMAILS` |
| `/api/cron/emails` | Disparo diário (21h UTC) | `CRON_SECRET` |
| `/api/lista-espera` | Webhook de captação | pública |

**`/momento` não está no matcher do middleware.** Ela se protege sozinha na página,
então não há brecha — mas fica sem o refresh de sessão que o middleware faz. Ao mexer
nela, considere adicionar ao matcher.

---

## Estrutura

```
/app
  /actions        auth · mapa · momento · objetivos · progresso · rotina
  /admin          back office
  /api            cron/emails · cron/teste · lista-espera
  /auth /content /mapa /diagnostico /momento /objetivos /rotina /dashboard
/components
  /ui             shadcn/ui
  /admin          Kpi · Funil · PainelMetricas · TabelaAlunos · Dedicacao · DistribuicaoModulos
  /mapa           MapaFlow · RevelacaoMapa · RevelacaoDiagnostico · AreaDestaqueOverlay
  /lp /lista-espera
/lib              ver tabela abaixo
/emails           5 templates react-email
/hooks            useMetaPixel · useUTMForward
/types/index.ts   tipos + PILARES + ESTACOES + COR_STATUS
```

### `/lib` — onde vive cada regra

| Arquivo | Responsabilidade |
|---|---|
| `analise.ts` | Diagnóstico do Mapa em 3 camadas |
| `blue-zones.ts` | Base científica por área, usada pela camada 3 |
| `metricas.ts` | **Todas** as agregações do back office |
| `progresso.ts` | Ponte índice da UI ↔ `modulo_id` do banco |
| `modulos.ts` / `lives.ts` | Catálogo de conteúdo (fonte de verdade) |
| `rotina.ts` | Cálculo de horas livres e Zona |
| `prazo.ts` | Labels de prazo de objetivo |
| `membros.ts` | Contagem de cadastrados |
| `email.ts` / `email-templates.ts` | Envio e montagem |
| `cron-auth.ts` | Validação do `CRON_SECRET` |
| `supabase.ts` / `-server.ts` / `-admin.ts` | Clientes browser / server / service-role |
| `validations.ts` | Schemas Zod |

---

## Modelo de dados

Fonte de verdade: os arquivos `SUPABASE_*_MIGRATION.md` e `migracao_*.sql` na raiz.

| Tabela | Campos-chave |
|---|---|
| `profiles` | `id`, `nome`, `criado_em`, `aulas_concluidas` (legado), `excluir_das_metricas` |
| `mapas` | `id`, `user_id`, `titulo`, `criado_em` |
| `areas` | `mapa_id`, `pilar`, `area`, `status`, `observacao` |
| `objetivos` | `texto`, `pilar`, `prazo`, `status`, `data_alvo`, `motivo`, `frequencia_lembrete`, `radar_faz_sentido`, `radar_por_mim` |
| `rotinas` | `horas_sono/trabalho/basicas/tela`, `dias_trabalho`, `percentual_livre`, `zona` — 1 por usuário |
| `momentos_vida` | `estacao`, `frase`, `duracao`, `data_revisao`, `ativo` — 1 ativo por usuário |
| `progresso_aulas` | `user_id`, `modulo_id`, `concluido_em`, `data_confiavel` |

### Invariantes que não podem ser quebrados

**`progresso_aulas.data_confiavel`** — `false` marca linhas migradas do array antigo,
cuja data é estimada (data de cadastro). Métricas de **tempo** filtram `true`; as de
**contagem** usam tudo. Sem isso, quem concluiu 7 módulos apareceria como tendo feito
tudo no mesmo segundo e destruiria as médias de ritmo.

**`profiles.aulas_concluidas`** é legado, não é mais escrito. Só remover depois de
validar o back office em produção.

**`profiles.excluir_das_metricas`** — contas internas somem do back office e do
contador de membros, mas a plataforma funciona normal para elas. Apagar dados de conta
interna seria o oposto do pretendido.

**`modulo_id` é texto** (`'modulo-3'`), não índice. Índice é posicional: reordenar
módulos corromperia o progresso de todos.

---

## Pilares e áreas

9 áreas em 3 pilares. **Fonte de verdade: `PILARES` em `types/index.ts`** — nomes,
áreas e perguntas reflexivas. Não duplique aqui; edite lá.

- **Corpo** — Exercícios Físicos, Alimentação, Hobbies
- **Mente** — Rede de Apoio, Trabalho, Finanças
- **Espírito** — Propósito, Experiências, Espiritualidade

Status: 🟢 verde (bem) · 🟡 amarelo (atenção) · 🔴 vermelho (mudança urgente).
Observação opcional: *"O que está por trás dessa escolha?"*

---

## Diagnóstico do Mapa (`lib/analise.ts`)

Substituiu a versão antiga, que escolhia entre 9 textos fixos pela maioria de cor.
Agora o texto é **composto** a partir das áreas que a pessoa marcou como críticas,
em três camadas:

1. **Seleção** — áreas mais graves (vermelho antes de amarelo), sem trava por pilar.
   Se as três piores forem do mesmo pilar, o texto foca nele: fidelidade ao relato
   vale mais que equilíbrio narrativo.
2. **Projeção temporal** — onde esse padrão chega, e onde chegaram as populações que
   cuidaram dessas áreas. Sempre na **moldura de ganho** (quanto a mais se vive),
   nunca de perda.
3. **Base científica** — por área, de `lib/blue-zones.ts`.

O ganho estimado usa um **número agregado** do estudo Blue Zones, não a soma dos
ganhos por área: os achados vêm de populações e metodologias diferentes e seus
efeitos se sobrepõem.

---

## Momento de Vida

Camada de intenção acima dos objetivos: a pessoa declara que fase está vivendo, e
isso guia o resto. Cinco estações — semear, construir, consolidar, recuperar,
transição — com duração de 3/6/12 meses e data de revisão.

**Fonte de verdade: `ESTACOES` e `DURACOES` em `types/index.ts`.**

Feature de **meados de agosto/2026**. Baixa adesão é esperado — não trate como
gargalo de funil, sobretudo na Turma 1, que não a tinha.

---

## Objetivos e Radar de Coerência

Objetivo tem pilar, prazo (curto/médio/longo), status e lembrete opcional.

O **Radar de Coerência** são duas perguntas obrigatórias na criação/edição:

- `radar_faz_sentido` — "faz sentido com o meu momento de vida?"
- `radar_por_mim` — "estou fazendo por mim ou para outras pessoas?"

Qualquer `false` exibe um selo de alerta no card — sinaliza objetivo possivelmente
nascido de comparação, **sem impedir** o uso. Nullable no banco para não quebrar
objetivos anteriores à feature; obrigatório na action.

---

## Calculadora de Rotina

A pessoa informa horas de sono, trabalho, necessidades básicas e tela; o cálculo
devolve percentual livre e classifica em duas zonas.

A **Zona** compara a ocupação real em horas contra uma *baseline de referência* — não
contra um percentual fixo. Assim ela reflete "acima ou abaixo do padrão esperado", e
não apenas "sobrou pouco tempo porque dormiu mais".

- **Zona de Privilégio** — mais margem que a média
- **Zona de Sacrifício** — no limite; objetivo novo exige remover algo antes

Config visual em `getZonaConfig()`. Uma rotina por usuário (`unique(user_id)`).

---

## Back office (`/admin`)

Protegido por `ADMIN_EMAILS` (lista separada por vírgula) no middleware. Toda leitura
passa pelo **cliente admin em Server Components** — o RLS restringe cada tabela ao
próprio usuário, e a service-role key nunca chega ao browser.

**Toda agregação vive em `lib/metricas.ts`.** Componentes só renderizam.

### Decisões que o código não explica

**Funil cumulativo** — cada etapa conta só quem cumpriu as anteriores. Sem isso o
gráfico "sobe" no meio (mais gente fez o Mapa do que marcou aula) e deixa de
significar algo. O bloco **Alcance** mostra o uso fora de ordem, ao lado.

**Features novas saem do funil de turmas antigas** — a flag `desdeTurma2` nas etapas.
Medir adesão ao Momento na Turma 1 mediria data de lançamento, não comportamento.

**Turma 1 não tem risco nem ritmo** — datas estimadas não têm posição no tempo. A tela
diz isso explicitamente em vez de exibir número falso.

**Dedicação não usa tempo de sessão.** Tempo de sessão mede aba aberta, e os módulos
6, 7 e 8 não têm vídeo — vivem no Notion. Quem assiste 1h30 do M7 apareceria com zero.
Medimos retorno e consistência: dias distintos com atividade, maior sequência, mediana
entre aulas, minutos de conteúdo concluído.

**Médias só contam quem começou** — incluir quem nunca abriu zeraria tudo sem dizer
nada sobre dedicação.

**Risco:** 7+ dias sem concluir aula (`DIAS_RISCO`), só Turma 2.

**Privacidade:** a tela mostra nome, e-mail e progresso, mas **nunca** as observações
do Mapa nem o texto dos objetivos. Dá para agir sem ler o que a pessoa escreveu no
momento mais vulnerável. Agregados de status seguem visíveis, sem nome atrelado.

---

## E-mails

5 templates em `/emails`, renderizados por react-email e enviados por SMTP.
Um cron diário (21h UTC, `vercel.json`) em `/api/cron/emails` decide o que disparar:

| Template | Quando |
|---|---|
| `planejamento-semanal` | domingos (checa BRT = UTC−3) |
| `lembrete-mensal` | marcos do ciclo do mapa: 30, 37, 44, 51, 58 dias |
| `lembrete-objetivo` | conforme `frequencia_lembrete`; para de cobrar prazo vencido |
| `momento-revisao` | ao chegar a `data_revisao` |
| `objetivo-concluido` | na conclusão |

Os e-mails citam o Momento de Vida ativo como fio condutor. Buscas de usuário são em
**batch** — não faça query por pessoa dentro de loop.

---

## Variáveis de ambiente

| Variável | Uso |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` / `_ANON_KEY` | cliente browser |
| `SUPABASE_SERVICE_ROLE_KEY` | cliente admin — **nunca** no browser |
| `ADMIN_EMAILS` | acesso a `/admin`, separados por vírgula |
| `CRON_SECRET` | autenticação do cron da Vercel |
| `SMTP_*` | host, port, secure, user, pass, from |
| `NEXT_PUBLIC_SITE_URL` | links absolutos em e-mails |
| `MAKE_WEBHOOK_URL` | integração da lista de espera |
| `NEXT_PUBLIC_META_PIXEL_LISTA_ESPERA_ID` | pixel de captação |

Ao adicionar variável nova: **`.env.local` e Vercel**, e a Vercel precisa de redeploy —
variáveis não se aplicam a builds existentes.

---

## Convenções

### Hierarquia de responsabilidade

- **Páginas** (`/app`) — orquestram: buscam dados, passam props, definem layout. Sem
  lógica de negócio.
- **Componentes** (`/components`) — só renderizam. Sem chamadas ao Supabase.
- **Actions e lib** — toda lógica, validação e acesso ao banco.

### Quando criar componente

Só o que aparece em mais de um lugar. Card de mapa e indicador de status, sim. Tela de
preparação (aparece uma vez), não.

### Nomes

`ComponenteNome.tsx` · `useNome.ts` · `nomeFuncao.ts`

### Estado

`useState` para formulários e UI temporária · Supabase para o que persiste · URL para
identificadores e filtros compartilháveis (o período do `/admin` é search param de
propósito) · Server Components para dados estáveis. **Nunca Redux ou Zustand.**

### Estilo

Só Tailwind — sem CSS inline nem `.css` separado. Paleta `mt-*` no
`tailwind.config.ts`. Interface e comentários em **português do Brasil**.

### Commits

`feat:` · `fix:` · `style:` · `refactor:`. Mensagem explica **por que**, não só o quê.

---

## Boas práticas

- Perguntar antes de refatorar o que não foi pedido
- Solução simples > solução elegante, quando o resultado é o mesmo
- Não instalar biblioteca sem avisar e justificar
- Commit após cada funcionalidade funcionando
- Nunca `npm run build` com o `dev` ativo
- **Ao mexer em métricas, validar contra o banco real** antes de afirmar que funciona
- Migração de schema: gerar um `.sql` **puro** (SQL Editor não entende Markdown) e
  colocar `ALTER`/`CREATE` antes de qualquer `UPDATE` no mesmo arquivo

---

## Manutenção deste arquivo

Rodar quando uma feature terminar, **antes do commit final**:

1. **Rota nova?** → tabela [Rotas](#rotas) + verificar `matcher` do middleware
2. **Tabela ou coluna nova?** → [Modelo de dados](#modelo-de-dados); se houver
   invariante (flag, unicidade, legado), documentar em *Invariantes*
3. **Arquivo novo em `/lib`?** → tabela [`/lib`](#lib--onde-vive-cada-regra)
4. **Variável de ambiente nova?** → tabela + lembrete da Vercel
5. **Decisão contra-intuitiva?** → seção da feature, explicando o **porquê**. É o
   conteúdo mais valioso daqui: o código mostra o quê, não o porquê da alternativa
   descartada
6. **Feature com data de lançamento relevante para métricas?** → registrar a data;
   adesão baixa em feature nova não é gargalo
7. **Template de e-mail novo?** → tabela [E-mails](#e-mails)

**Não** documentar: estrutura óbvia de código, histórico de bugs corrigidos, o que o
git já conta, ou listas que duplicam constantes do `types/index.ts` — aponte para a
constante.

### Fases

- ✅ **Fase 1** — auth, AHA moment, dashboard, CRUD de mapas
- ✅ **Fase 2** — Momento de Vida, Objetivos + Radar, Calculadora de Rotina, e-mails,
  back office
- 🔜 **Fase 3** — comparativo entre mapas ao longo do tempo; % de vídeo assistido
  (YouTube IFrame API) se as métricas de ritmo não bastarem
- 🔜 **Fase 4** — React Native + Expo, mesmo Supabase, reaproveitando lógica e tipos

Não gerar código de fase futura sem pedido.
