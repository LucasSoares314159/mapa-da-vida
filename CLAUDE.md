# Mapa da Vida — CLAUDE.md

> **Como manter este arquivo:** ele descreve o que o código **não** diz por si só —
> decisões, invariantes e armadilhas. Não duplique o que se lê na fonte: aponte para
> ela. Ao terminar uma feature, rode o checklist em [Manutenção deste arquivo](#manutenção-deste-arquivo).

---

## Produto

**Trilha da Produtividade** (MindTrail) é um programa pago que ensina a pessoa a
construir seu próprio sistema de organização pessoal. São 8 módulos (`modulo-0` a
`modulo-7`) e lives. **Fonte de verdade: `MODULOS` em `lib/modulos.ts`** — a contagem
e a duração total da trilha derivam dela.

O **Mapa da Vida** é o Módulo 3 e o AHA moment: um diagnóstico reflexivo em que a
pessoa classifica 9 áreas da vida como verde/amarelo/vermelho e recebe um
fluxograma com análise. O choque de realidade motiva a mudança.

A plataforma web hospeda a trilha e quatro ferramentas que a acompanham: **Mapa**,
**Momento de Vida**, **Objetivos** e **Calculadora de Rotina**. Os vídeos vivem no
**YouTube** (embed por `videoId`). O texto de cada aula é nativo da plataforma — ver
[Conteúdo dos módulos](#conteúdo-dos-módulos-admin-modulos) — migrado manualmente do
Notion, que deixou de ser a fonte.

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
| `/content/modulo/[id]` | Aula individual | ✅ |
| `/content/material/[id]` | Material de apoio — quadro do Excalidraw | ✅ |
| `/mapa/novo` → `/mapa/[id]` | Fluxo conversacional do AHA moment | ✅ |
| `/mapa/preparacao` | Redirect para `/mapa/novo` — mantida pelos links já publicados | ✅ |
| `/diagnostico/[id]` | Diagnóstico completo | ✅ |
| `/momento` | Momento de Vida | ✅ |
| `/objetivos` | Objetivos + Radar de Coerência | ✅ |
| `/rotina` | Calculadora de Rotina | ✅ |
| `/dashboard` | Mapas salvos e evolução | ✅ |
| `/admin` | Back office de métricas | ✅ + `ADMIN_EMAILS` |
| `/admin/modulos`, `/admin/modulos/[id]` | Editor do conteúdo escrito das aulas | ✅ + `ADMIN_EMAILS` |
| `/api/cron/emails` | Disparo diário (21h UTC) | `CRON_SECRET` |
| `/api/lista-espera` | Webhook de captação | pública |
| `/api/stripe/checkout` | Cria Checkout Session de pagamento único | pública (POST) |
| `/api/stripe/webhook` | Confirma pagamento e dispara acesso | assinatura Stripe |
| `/api/admin/compras/reenviar-acesso` | Regenera link de uma compra | ✅ + `ADMIN_EMAILS` |
| `/compra/sucesso` | Confirmação visual após o Checkout | pública |
| `/quiz/[slug]` | Funil de quiz: perguntas → diagnóstico → VSL → checkout | pública |

Toda rota autenticada passa pelo `matcher` do middleware, que além de barrar
visitante também **renova a sessão**. Ao criar rota protegida, adicione ao matcher —
uma página que só se defende com `getUser()` funciona, mas perde esse refresh.

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
/emails           6 templates react-email
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
| `modulos.ts` | Catálogo das aulas — título, duração, `videoId` (fonte de verdade) |
| `materiais.ts` | Catálogo dos materiais de apoio — título e URL do quadro |
| `conteudo-modulos.ts` | Leitura/escrita dos blocos de texto de cada módulo (tabela `modulos_conteudo`) |
| `rotina.ts` | Cálculo de horas livres e Zona |
| `onboarding.ts` | Passos, progresso e falas do Mapa conversacional |
| `gate-mapa.ts` | Cookie e isenções do gate do primeiro mapa |
| `prazo.ts` | Labels de prazo de objetivo |
| `membros.ts` | Contagem de cadastrados |
| `email.ts` / `email-templates.ts` | Envio e montagem |
| `stripe.ts` | Cliente server-side do Stripe |
| `acesso-compra.ts` | Emissão, hash, validação e envio de links de acesso |
| `cron-auth.ts` | Validação do `CRON_SECRET` |
| `checkout/` | Abstração do provider de pagamento — ver [Funil de quiz](#funil-de-quiz) |
| `quiz/` | Motor de pontuação, passos, sessão e configs dos quizzes |
| `tracking/` | `track()` do funil, captura de atribuição e Conversions API |
| `supabase.ts` / `-server.ts` / `-admin.ts` | Clientes browser / server / service-role |
| `validations.ts` | Schemas Zod |

---

## Modelo de dados

Fonte de verdade: os arquivos `SUPABASE_*_MIGRATION.md`, `migracao_*.sql` na raiz e
as novas migrações versionadas em `supabase/migrations`.

| Tabela | Campos-chave |
|---|---|
| `profiles` | `id`, `nome`, `criado_em`, `aulas_concluidas` (legado), `excluir_das_metricas`, `data_nascimento`, `profissao`, `profissao_outro` |
| `mapas` | `id`, `user_id`, `titulo`, `criado_em` |
| `areas` | `mapa_id`, `pilar`, `area`, `status`, `observacao` |
| `objetivos` | `texto`, `pilar`, `prazo`, `status`, `data_alvo`, `motivo`, `frequencia_lembrete`, `radar_faz_sentido`, `radar_por_mim`, `ritmo`, `ordem` |
| `rotinas` | `horas_sono/trabalho/basicas/tela`, `dias_trabalho`, `percentual_livre`, `zona` — 1 por usuário |
| `momentos_vida` | `estacao`, `frase`, `duracao`, `data_revisao`, `ativo` — 1 ativo por usuário |
| `progresso_aulas` | `user_id`, `modulo_id`, `concluido_em`, `data_confiavel` |
| `modulos_conteudo` | `modulo_id` (PK, texto), `blocos` (jsonb), `atualizado_em` |
| `compras` | sessão/pagamento Stripe, e-mail, status, `user_id`, datas do funil |
| `tokens_acesso_compra` | hash do token, expiração, uso e invalidação |
| `stripe_webhook_events` | IDs de evento já recebidos para idempotência |

### Invariantes que não podem ser quebrados

**`progresso_aulas.data_confiavel`** — `false` marca linhas migradas do array antigo,
cuja data é estimada (data de cadastro). Métricas de **tempo** filtram `true`; as de
**contagem** usam tudo. Sem isso, quem concluiu 7 módulos apareceria como tendo feito
tudo no mesmo segundo e destruiria as médias de ritmo.

**`profiles.aulas_concluidas`** é legado, não é mais escrito. Só remover depois de
validar o back office em produção.

**Links de compra** — apenas o SHA-256 do token é persistido. Um novo envio invalida
todos os links anteriores ainda ativos; `used_at` impede reutilização depois do cadastro.
`stripe_webhook_events.event_id` impede e-mail duplicado quando o Stripe reenvia eventos.

**`profiles.excluir_das_metricas`** — contas internas somem do back office e do
contador de membros, mas a plataforma funciona normal para elas. Apagar dados de conta
interna seria o oposto do pretendido.

**`objetivos.ritmo IS NULL` significa "nunca declarou"**, não "está parado". É o que faz
o card mostrar "Definir ritmo" em tom neutro em vez de vermelho. Os objetivos anteriores à
feature ficam nulos de propósito — derivar o ritmo do prazo inventaria uma declaração que a
pessoa nunca fez. Mesmo padrão do Radar de Coerência e de `profiles.data_nascimento`.

**`objetivos.ordem` é por `(user_id, prazo)`**, não global. Reordenar numa aba não mexe nas
outras. `NULL` cai no fim da lista (`nullsFirst: false` na query), nunca no topo.

**`modulo_id` é texto** (`'modulo-3'`), não índice. Índice é posicional: reordenar
módulos corromperia o progresso de todos. `modulos_conteudo.modulo_id` usa o mesmo
texto, sem FK — ver [Conteúdo dos módulos](#conteúdo-dos-módulos-admin-modulos).

O texto protege contra **reordenar**, não contra **renumerar**: se o id passa a
designar outra aula, o progresso continua válido apontando para a coisa errada. Foi o
caso da fusão de outubro/2026 (`supabase/migrations/20261012120000_remapeia_modulos_6_7.sql`),
em que o antigo `modulo-8` virou `modulo-7` — sem o remapeamento, quem concluiu
"O Segredo da Consistência" apareceria como tendo concluído um módulo que saiu da
trilha. Mexer na cauda de `MODULOS` exige migração de `progresso_aulas` **e** de
`modulos_conteudo`.

---

## Pilares e áreas

9 áreas em 3 pilares. **Fonte de verdade: `PILARES` em `types/index.ts`** — nomes,
áreas e perguntas reflexivas. Não duplique aqui; edite lá.

- **Corpo** — Exercícios Físicos, Alimentação, Hobbies
- **Mente** — Rede de Apoio, Trabalho, Finanças
- **Espírito** — Propósito, Experiências, Espiritualidade

Status: 🟢 verde (bem) · 🟡 amarelo (atenção) · 🔴 vermelho (mudança urgente).
Observação **obrigatória** (mínimo 40 caracteres): *"O que está por trás dessa escolha?"*
Ver [Mapa conversacional](#mapa-conversacional-e-gate-de-primeiro-acesso).

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

## Mapa conversacional e gate de primeiro acesso

Feature de **outubro/2026**. O Mapa deixou de ser um questionário de 3 telas (uma por
pilar) e virou um fluxo conversacional: **uma pergunta por tela**, com animação de escrita
e revelação progressiva das opções. As 9 perguntas continuam vindo de `PILARES` —
`lib/onboarding.ts` só as achata na ordem corpo → mente → espírito.

**O Mapa é obrigatório no primeiro acesso** — para quem se cadastrou a partir de
**08/10/2026** (`GATE_VALE_DESDE`). Sem nenhum mapa salvo, nada da plataforma abre. O
diagnóstico é o pilar sobre o qual o método se aplica; estudar antes dele é aplicar
conteúdo no vácuo.

### Decisões que o código não explica

**O gate não é retroativo.** Quando ele foi para produção, 7 dos 16 alunos pagantes não
tinham mapa algum — dois da Turma 1, cadastrados em junho e julho. Aplicar a regra a
todos trancaria quem já pagou fora da plataforma até responder 9 perguntas com
observação obrigatória, para corrigir uma ausência que o produto nunca exigiu deles.
`gateValeParaConta()` compara `profiles.criado_em` com `GATE_VALE_DESDE`: quem entra
depois conhece o Mapa como porta de entrada, quem já estava dentro é convidado, nunca
barrado. A função responde `false` quando a data não dá para ler — deixar navegar é
melhor que trancar um cliente por causa de um dado ilegível.

O cookie `mapa_ok` também é gravado para a conta isenta: a isenção não muda, então
reconsultar `profiles` a cada navegação seria desperdício.

**O gate é cookie, não query por request.** `lib/gate-mapa.ts` guarda `mapa_ok`. O
middleware consulta `mapas` **uma única vez** — enquanto o cookie não existe — e depois
nunca mais. Checar o banco em toda navegação custaria uma query por page view de todo
usuário, para sempre, por uma resposta que só muda uma vez na vida da conta. O cookie é
**cache, nunca autoridade**: quem o forjar apenas evita um redirect, porque cada página
segue lendo do banco com RLS. `logout()` o apaga — sem isso a próxima conta no mesmo
navegador herdaria o gate aberto.

**`/admin` é isento do gate.** Quem dá suporte precisa abrir o back office sem ser
obrigado a fazer o próprio diagnóstico. A rota já é protegida por `ADMIN_EMAILS`.

**`/mapa/*` também é isento** — sem isso o fluxo obrigatório redirecionaria para si mesmo.

**`/mapa/preparacao` virou redirect.** A tela de preparação foi absorvida pelas falas de
abertura (`falasContexto()`). A rota permanece porque é o destino de links já publicados:
os dois crons de e-mail, a Sidebar, o dashboard, a calculadora e a landing page. Manter
duas telas de "antes de começar" seria repetir a mesma mensagem em dois lugares.

**Observação obrigatória, coluna nullable.** O mínimo de 40 caracteres (`MIN_OBSERVACAO`,
fonte única em `lib/validations.ts`) é validado no cliente *e* em `criarMapa()`, mas
`areas.observacao` segue aceitando nulo no banco: pôr `NOT NULL` invalidaria
retroativamente os mapas anteriores à feature. Mesmo padrão do Radar de Coerência.
Quarenta força uma frase com sujeito e motivo — dez aceitavam `"sei la nao"`, que cumpria
a regra sem dizer nada a quem lesse depois, inclusive a própria pessoa ao comparar mapas.

**A revelação abre com o retrato do próprio mapa, não com o ganho do estudo.** A primeira
tela mostra as 9 áreas **em três colunas, uma por pilar**, e só então liga o resultado ao
dado das Blue Zones. Abrir com o número agregado punha algo abstrato antes de a pessoa ver
o próprio resultado; empilhar as 9 na vertical passava de 1200px, exigia rolagem e matava
a leitura de conjunto, que é o ponto de um mapa.

**O indicador "toque para continuar" fica no fluxo, não em `absolute`.** Sobreposto, ele
colidia com o texto nas telas mais altas e sumia no meio da leitura.

**A tela de projeção foi removida da revelação.** `montarProjecao()` compõe texto a partir
de **contagens** de cor, sem nunca citar as áreas da pessoa — servia para qualquer mapa com
o mesmo placar. As telas por área, que vêm logo depois, dizem o mesmo com nome e base
científica específicos. `diagnostico.projecao` continua existindo e é usado em
`/diagnostico/[id]`; só saiu da sequência rápida.

**A tela do mapa tem saídas explícitas.** "Ver diagnóstico completo" e "Ir para o conteúdo
da Trilha" como botões grandes abaixo do fluxograma: antes a única saída era um link de
12px no header, e não havia rota de volta para a Trilha.

**Pilar e área aparecem em 20px no preenchimento.** Em 11px, ao lado de uma pergunta em
26px, a pessoa não percebia qual área estava avaliando.

**A abertura explica o Mapa antes de pedir qualquer resposta.** Quatro beats em
`falasContexto()`: o que é → em que se baseia (Blue Zones) → para que serve (termômetro do
impacto da Trilha, repetível) → tempo e foco. A pessoa chega sem contexto nenhum; sem
isso, responde 9 perguntas íntimas sem saber para quê. A Blue Zones entra como
credibilidade da metodologia, **nunca** como promessa de anos de vida — o número do ganho
é enquadramento do diagnóstico, não gancho de abertura.

**A tela é um chat, não uma landing.** A hierarquia das falas é só tamanho e peso
(`nivel` e `forte` em `BolhaGuia`). Eyebrow maiúsculo, borda à esquerda e itálico
editorial foram deliberadamente removidos: ornamento quebra a ilusão de conversa.

**As opções só aparecem depois de a pergunta terminar de ser escrita.** O gatilho é a
conclusão da digitação da última fala, não a contagem de falas visíveis — num passo de
fala única a contagem já nasce satisfeita e as opções apareceriam fixas durante a escrita.

**O fluxograma carrega sob demanda.** `MapaFlow` entra por `next/dynamic` dentro de
`RevelacaoMapa`: importado estaticamente, ele puxava `@xyflow/react` e ninguém via o
diagnóstico até o fluxograma inteiro baixar — mesmo sem nunca abrir aquela aba. O First
Load de `/mapa/[id]` caiu de 210 kB para 143 kB.

**Rascunho em `sessionStorage`, não `localStorage`.** Nove respostas são trabalho demais
para se perder num F5. Mas um rascunho de semanas atrás reaparecendo quando a pessoa vai
**refazer** o mapa seria pior que perder: ela acharia que já respondeu. A retomada é
sempre oferecida, nunca aplicada em silêncio.

A chave **inclui o `user_id`** (`mapa-conversa-rascunho:<id>`): `sessionStorage` é por
origem, não por conta, então sem isso trocar de usuário na mesma aba herdaria as respostas
do anterior — e `logout()` não tem como limpá-lo, porque é server action e o storage é do
browser.

**A barra de progresso mede a posição no fluxo, não as respostas preenchidas.** Contar
respostas completas fazia a barra nascer cheia (e travar em "último passo") quando um
rascunho era restaurado, além de não recuar ao voltar uma pergunta. A contagem de respostas
continua existindo, como guarda contra envio incompleto.

**Tempo é expectativa, não cronômetro.** `estimarTempoRestante()` mostra "~4 min", nunca
contagem regressiva ao vivo: cronômetro correndo induz resposta rápida, o oposto da
reflexão que o Mapa pede. O total anunciado na abertura deriva da mesma constante, então
os dois números não podem divergir.

**Perfil (nascimento + profissão) é gravado ao sair da sua tela**, não junto com o mapa —
abandono no meio das 9 perguntas não deve perder o dado de mentoria. Vai pelo **cliente
admin**, como todo write em `profiles`: um UPDATE sem policy de RLS correspondente
retornaria sucesso com zero linhas, falhando em silêncio; a action confere a linha afetada.

**`profiles.data_nascimento IS NULL` significa "nunca respondeu"**, não "não quis". É o
que faz a tela de perfil aparecer. As 13 contas anteriores à feature ficam nulas de
propósito — preenchê-las com estimativa criaria segmentação falsa de mentoria.

**Acessibilidade:** a animação de escrita respeita `prefers-reduced-motion` (texto
completo no primeiro frame) e é interrompível com um clique. O span animado é
`aria-hidden`; o texto completo vai num nó `sr-only`, para o leitor de tela anunciar a
frase uma vez em vez de letra por letra. As 3 opções são um `radiogroup` navegável por
setas, e o status nunca é comunicado só por cor.

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

**Não há limite de objetivos por prazo.** Existiu um teto de 3, que bloqueava a criação e
pintava o contador de vermelho. A contagem continua visível — informa sem impedir.

O **Radar de Coerência** são duas perguntas obrigatórias na criação/edição:

- `radar_faz_sentido` — "faz sentido com o meu momento de vida?"
- `radar_por_mim` — "estou fazendo por mim ou para outras pessoas?"

Qualquer `false` exibe um selo de alerta no card — sinaliza objetivo possivelmente
nascido de comparação, **sem impedir** o uso. Nullable no banco para não quebrar
objetivos anteriores à feature; obrigatório na action.

### Refatoração de outubro/2026 — ritmo, ordem e hierarquia

A tela era sobre o Momento de Vida: o card dele ocupava ~170px e tinha a frase em 18px,
contra 15px do texto do objetivo. O componente tinha sido desenhado para "reinar
visualmente" e conseguiu — a funcionalidade principal virou coadjuvante. Virou faixa de
~90px, que mantém o fundo na cor da estação mas perde o eyebrow, o rodapé de revisão e a
sombra alta. **A revisão só aparece quando está vencida:** "revisar em 48 dias" era ruído
no topo de toda visita; "passou da hora de revisar" é a única variante que pede ação.

**O ritmo é declarado, não calculado.** `ritmo` (verde avançando / amarelo travado /
vermelho parado, `RITMOS` em `types/index.ts`) é escolhido pela pessoa no card. Derivar do
prazo era a alternativa mais barata e foi descartada: prazo folgado não significa que o
objetivo está andando, e prazo apertado não significa que travou — o dado derivado mediria
o calendário, não a realidade. O custo aceito é um toque a mais por objetivo.

**O atraso pinta a data, não o semáforo.** São dois sinais que querem dizer coisas
diferentes: a bolinha é a percepção declarada, a data é o fato do calendário. Deixar o
atraso sobrescrever a bolinha apagaria a declaração da pessoa — ela marca "avançando" e o
card insiste em vermelho. O chip "Prazo passou" foi removido porque a informação migrou
para a própria data, e a linha de chips já acumulava até quatro elementos.

**O atraso agora vale para `pausado` também.** Antes só era calculado para `status ===
'ativo'`, então pausar um objetivo vencido fazia o aviso desaparecer — exatamente o caso
em que ele importa mais.

**Concluídos afundam para o fim da aba**, atrás de um separador, e saem da reordenação: a
ordem manual é sobre o que ainda exige ação. Ficam visíveis (riscados, opacidade reduzida)
em vez de escondidos atrás de um toggle — esconder a conquista tira o retorno de marcar o
checkbox.

**A reordenação é por aba, com `Reorder` do `motion`** (já instalado; nenhuma dep nova) e
**handle dedicado** em vez do card inteiro arrastável: o card tem 4 alvos de toque e, no
mobile, arrastar para rolar a página moveria o objetivo sem intenção. O handle move o item
com ↑/↓ quando focado — DnD só com ponteiro exclui quem navega por teclado.

A gravação tem **debounce de 600ms**, e três detalhes não óbvios: a aba é capturada no
momento do arrasto (não na hora de gravar, senão trocar de aba grava os ids sob o prazo
errado); o rollback guarda o estado de antes do **primeiro** arrasto da rajada; e trocar de
aba ou desmontar a tela **dispara a gravação pendente** em vez de só limpar o timer.

**A lista arrastável entra por `next/dynamic`.** `Reorder` puxa o motor de animação do
`motion` inteiro: importado estaticamente, o First Load de `/objetivos` ia de 121 kB para
180 kB numa rota que antes não usava `motion`. Mesmo motivo e mesmo padrão do `MapaFlow`
em `RevelacaoMapa`. Com o dynamic, ficou em 134 kB.

**O modal virou `components/ui/dialog.tsx`** (shadcn sobre `@radix-ui/react-dialog`, que
estava instalado e nunca tinha sido importado). Era um overlay manual de 440px em `style`
inline, sem Esc, focus trap, scroll lock nem ARIA. A largura passou a 560px na escala
Tailwind — número mágico inline é o que faz o próximo modal reinventar a medida.

Também nasceu `components/ui/indicador-status.tsx`, porque o semáforo verde/amarelo/vermelho
estava reimplementado em **seis** lugares com hex divergentes (e o `COR_STATUS` de
`types/index.ts` é código morto). Os seis usos antigos **não** foram migrados — não era o
pedido; o componente está pronto para quem encostar neles.

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

## Conteúdo dos módulos (`/admin/modulos`)

Substitui o link externo que cada aula tinha para o Notion: o texto agora é nativo,
em blocos estruturados (`lib/conteudo-modulos.ts`, tipo `Bloco`), editado em
`/admin/modulos/[id]` e lido em `/content/modulo/[id]` via `ConteudoModulo`.

**Só o texto migrou para o banco — título, duração e `videoId` continuam em
`lib/modulos.ts`.** `MODULOS` é importado de forma síncrona em vários lugares,
inclusive `lib/metricas.ts` (cálculo de duração, funil, drop-off por módulo) fora de
um Server Component. Migrar esses campos também obrigaria tornar essa leitura
assíncrona e reescrever o back office. `modulos_conteudo.modulo_id` referencia o
mesmo texto (`'modulo-3''`) só por convenção, sem FK.

Upload de imagem vai para o bucket público `modulos-imagens` no Supabase Storage, via
`app/actions/admin-conteudo.ts` (service role — só a leitura do conteúdo tem policy de
RLS para usuário comum; escrita e upload passam pelo cliente admin).

**Módulos não têm mais estado "indisponível".** Antes um módulo sem link do Notion
ficava bloqueado na trilha; migrar o texto é um processo manual e gradual, então todo
módulo com `videoId` já é navegável mesmo com `blocos` vazio.

**O bloco `embed` tem allowlist de domínio** (`HOSTS_EMBED` e
`normalizarUrlEmbed()` em `lib/conteudo-modulos.ts`), hoje só Excalidraw. O bloco monta
um `iframe`, então URL livre seria código de terceiro rodando dentro da aula. A
checagem roda em três lugares de propósito: no editor (feedback), na action (um bloco
montado fora da UI não passa pelo editor) e na leitura (um bloco salvo antes da
allowlist não deve virar iframe). O campo aceita o `<iframe>` inteiro colado e extrai o
`src` — pedir que o admin garimpe a URL no HTML era atrito sem ganho.

O embed estoura a coluna de leitura de 640px até ~900px no desktop: um quadro do
Excalidraw em largura de texto fica pequeno demais para ser usado.

O bloco continua disponível no editor, mas **nenhuma aula o usa hoje**: os dois quadros
do Excalidraw ficam na seção de materiais — ver
[Materiais & Frameworks](#materiais--frameworks). `normalizarUrlEmbed()` é compartilhada
pelos dois caminhos, então a allowlist vale para ambos.

---

## Materiais & Frameworks

Compilado de material de apoio em `/content`, abaixo das aulas. Catálogo estático em
`lib/materiais.ts`; cada entrada abre em `/content/material/[id]` com o quadro do
Excalidraw embutido, validado pela allowlist de `lib/conteudo-modulos.ts`.

**Substituiu a seção de lives em outubro/2026.** Eram 3 gravações com links de Canva e
um podcast no Drive (`lib/lives.ts`, `components/LiveAula.tsx`, `/content/live/[id]` —
tudo recuperável no git). A seção já funcionava como compilado de apoio, não como
trilha: virar materiais foi nomear o que ela era.

**Não mostra duração nem contagem de itens.** A seção de aulas mostra
`{N} aulas • {duração total}` porque lá isso é o progresso da trilha; aqui seria
ruído — ninguém "assiste 1h02" de um framework. A assimetria com a seção de aulas é
deliberada: não "corrija" devolvendo os números.

**Materiais não têm tabela no banco**, ao contrário do texto das aulas
(`modulos_conteudo`). São duas URLs em catálogo estático, como `MODULOS` sempre foi;
criar tabela, RLS e tela de admin para isso seria desproporcional. O custo é real:
editar material exige commit e deploy. Se o volume crescer, o padrão de
`modulos_conteudo` é o caminho.

**Materiais não entram em métricas nem em progresso** — as lives também nunca
entraram. Não há `progresso_aulas`, funil, nem soma de duração: `MODULOS` segue sendo a
fonte única da contagem da trilha.

---

## Funil de quiz

Feature de **outubro/2026**, construída como **teste de hipótese**: anúncio →
`/quiz/[slug]` → diagnóstico → VSL vertical → checkout. É um caminho de venda
paralelo à LP `/trilha`, não um substituto — os dois apontam para o mesmo checkout.

O quiz **não captura contato**: nada de e-mail ou WhatsApp, nada gravado em banco.
As respostas vivem em `sessionStorage` e morrem com a aba. O que sobrevive é o que
vira metadado da cobrança de quem compra.

Regras, perguntas e textos são **fonte de verdade dos docs** em `docs/`
(`REGRAS DE PONTUAÇÃO DO QUIZ.md` e `[Lucas Soares] Quiz.md`). Os docs são
explícitos: não alterar a redação sem aprovação.

### Como criar um novo quiz

1. Copie `lib/quiz/configs/quiz-1.ts` para `quiz-2.ts` e mude o `slug`.
2. Edite perguntas, pesos, textos de resultado e a config da VSL.
3. Registre em `QUIZZES` de `lib/quiz/registro.ts`.
4. `npm test` — os testes de integridade conferem a config.

Pronto: `/quiz/quiz-2` existe. **Nenhuma tela nova, nenhuma rota nova.** Um
componente renderiza qualquer `ConfigQuiz`; se criar um quiz exigir escrever
componente, a config é que está com campo faltando.

Ao mudar perguntas ou pesos de um quiz **já no ar**, incremente `versao`: ela
invalida os rascunhos em `sessionStorage`, que de outro modo pontuariam respostas
antigas com a matriz nova.

### Decisões que o código não explica

**Os limiares da classificação vivem na config, não no motor.** Mínimo de 4 pontos,
vantagem de 2 e ordem de desempate são "hipóteses operacionais" segundo os docs, a
recalibrar com respostas reais. No motor, recalibrar o quiz-1 mudaria o quiz-2 junto.

**O desempate dispara por vantagem insuficiente, não por empate exato.** O Exemplo 5
dos docs (A=5, B=2, C=4) espera desempate embora A e C não estejam empatadas. Ler
"empatadas" como igualdade estrita jogaria aquele caso em Análise Geral, contra o
resultado que o próprio doc declara esperado.

**A pergunta 2 não pontua em alternativa nenhuma.** Não é peso esquecido: ela
identifica o desejo principal para segmentação, e os docs proíbem usá-la como critério.
Há teste cobrindo isso, porque é o tipo de "correção" que alguém faria de boa fé.

**Q6-C soma B+2, não C+2.** Fala de rotina e imprevisto, mas a matriz a classifica
como falha de sustentação — e o Exemplo 3 só fecha assim.

**A rota é `noindex`.** O tráfego é pago e a página só faz sentido com a origem do
anúncio; indexada, competiria com a LP na busca.

**Layout sem Header, Sidebar nem rodapé.** Quem chega de anúncio tem uma tarefa.
Qualquer navegação visível aqui é uma saída do funil.

**`/quiz/*` fica fora do `matcher` do middleware.** É rota pública e sem sessão: passar
pelo middleware custaria uma consulta de auth por visita de tráfego frio, para nada.

**Estado em `useReducer`, não dois `useState`.** Índice e respostas mudam juntos ao
avançar; separados, a gravação do rascunho poderia rodar entre as duas atualizações e
persistir um par inconsistente.

**A barra mede a posição no fluxo, não as respostas preenchidas** — mesma lição do
Mapa conversacional: restaurar rascunho faria a barra nascer cheia, e voltar não a faria
recuar. O denominador conta só as perguntas; as telas de copy não são etapas que a
pessoa cumpre.

**Rascunho em `sessionStorage`, limpo ao chegar no resultado.** Perder seis respostas
num F5 é ruim, mas um rascunho antigo reaparecendo para quem volta pelo anúncio seria
pior: a pessoa veria um resultado que não respondeu agora.

### Checkout agnóstico de provider

`startCheckout()` em `lib/checkout/` resolve o provider por `CHECKOUT_PROVIDER` e
devolve a URL de pagamento. **O quiz nunca importa Stripe:** chama a rota por `fetch` e
recebe a URL.

A rota continua em `/api/stripe/checkout` de propósito — mover a URL quebraria os dois
`<form>` de `public/trilha/index.html`, que é HTML estático. **O caminho não decide mais
o provider; a variável decide.**

A leitura do corpo é retrocompatível: a LP posta form sem corpo e recebe `303`, o quiz
manda JSON e recebe a URL. Corpo inválido cai no caminho da LP em vez de falhar — nada
no tracking justifica impedir alguém de comprar.

**Para ligar a AbacatePay quando ela subir:** implementar `ProviderCheckout` em
`lib/checkout/abacatepay-provider.ts`, registrar no mapa de `lib/checkout/index.ts` e
apontar `CHECKOUT_PROVIDER` para ela. Nada em `components/quiz` muda. O webhook dela
precisa replicar o que o da Stripe faz: idempotência por id de evento, `upsert` em
`compras` e `enviarLinkAcessoCompra()`. Se ela não aceitar metadado arbitrário, a
alternativa é uma tabela própria ligada ao id da cobrança — o slug e o perfil não podem
se perder, são eles que tornam a origem rastreável.

O metadata é espelhado em `payment_intent_data`: o webhook lê a Session, mas reembolso e
relatório financeiro veem o Payment Intent, e sem o espelho a origem se perderia lá.

### Tracking

`track()` em `lib/tracking/eventos.ts` manda cada evento para o **Pixel e o GA4** na
mesma chamada: o Pixel alimenta a otimização da campanha, o GA4 dá o relatório de funil
com abandono por etapa — que no Gerenciador da Meta exigiria uma conversão personalizada
por passo.

Eventos: `quiz_view` · `quiz_start` · `quiz_answer` (com etapa) · `quiz_complete` (com
perfil, regra e pontuações) · `vsl_play` · `cta_click`.

São **eventos customizados**, não padrão da Meta: mapeá-los a `Lead` ou `ViewContent`
misturaria o funil do quiz com o da lista de espera no mesmo relatório. Para virarem
objetivo de campanha, precisam de **conversão personalizada** criada no Gerenciador.

**O Purchase não existia no projeto** — a compra era cega para a Meta. Agora dispara em
par: Pixel em `/compra/sucesso` e CAPI no webhook, com `event_id` derivado da Checkout
Session. Os dois lados chegam ao mesmo id sem trocar nada entre si, a Meta deduplica e um
retry do Stripe não vira segunda venda.

**A CAPI nunca lança e roda depois do e-mail de acesso.** Falhar ali faria o Stripe
reenviar o evento e reprocessar a compra: perder um evento de tracking é muito mais
barato que duplicar uma venda ou um e-mail.

**A atribuição é capturada na entrada**, não no clique do CTA, que acontece várias telas
depois e já perdeu a query string. A primeira captura com origem real ganha; os cookies
do Pixel são reatualizados, porque podem ter sido gravados depois da primeira tela.

### Pendências

- **`videoId` da VTurb** está vazio em `lib/quiz/configs/quiz-1.ts`. Sem ele o player não
  é montado e o CTA aparece de imediato — a tela de compra nunca fica sem saída.
- **`ctaAtSeconds` está em 0** enquanto não há vídeo. Com vídeo, ajustar ao ponto do
  roteiro.
- **Na VTurb o CTA é liberado por temporizador** desde a montagem, não pelo tempo real de
  reprodução: o custom element não expõe progresso de forma estável. Quem pausa vê o botão
  antes do ponto do roteiro — assumido para não prender o CTA atrás de um evento que pode
  nunca chegar.
- **`META_CAPI_TEST_CODE` deve ser removido** depois de validar no Gerenciador, senão os
  eventos seguem chegando como teste e não contam para a campanha.

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

6 templates em `/emails`, renderizados por react-email e enviados por SMTP.
Um cron diário (21h UTC, `vercel.json`) em `/api/cron/emails` decide o que disparar:

| Template | Quando |
|---|---|
| `planejamento-semanal` | domingos (checa BRT = UTC−3) |
| `lembrete-mensal` | marcos do ciclo do mapa: 30, 37, 44, 51, 58 dias |
| `lembrete-objetivo` | conforme `frequencia_lembrete`; para de cobrar prazo vencido |
| `momento-revisao` | ao chegar a `data_revisao` |
| `objetivo-concluido` | na conclusão |
| `acesso-plataforma` | após confirmação do pagamento pelo webhook Stripe |

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
| `STRIPE_SECRET_KEY` | chave server-side do Stripe (`sk_test_` no sandbox) |
| `STRIPE_PRICE_ID` | preço único vendido pelo Checkout |
| `STRIPE_WEBHOOK_SECRET` | valida assinatura do webhook (`whsec_`) |
| `ACCESS_LINK_TTL_HOURS` | validade do link de cadastro; padrão 168h |
| `CHECKOUT_PROVIDER` | provider de pagamento ativo; padrão `stripe` |
| `NEXT_PUBLIC_QUIZ_ATIVO` | `false` desliga o funil de quiz (404 em todo slug) |
| `NEXT_PUBLIC_META_PIXEL_QUIZ_ID` | pixel do funil de quiz — separado do de captação |
| `NEXT_PUBLIC_GA_ID` | GA4 nas rotas do quiz; o mesmo id da LP |
| `META_PIXEL_ID` / `META_CAPI_ACCESS_TOKEN` | Purchase server-side pela Conversions API |
| `META_CAPI_TEST_CODE` | só durante a validação no Gerenciador — **remover depois** |

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
