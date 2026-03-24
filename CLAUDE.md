# Mapa da Vida — CLAUDE.md

## Visão Geral do Produto
**Mapa da Vida** é o AHA moment de um programa chamado **Personal System** (MindTrail), que ensina pessoas a construir seu próprio sistema de organização pessoal. O Mapa da Vida é o Módulo 1 — um diagnóstico reflexivo onde o usuário responde perguntas sobre pilares da vida, classifica cada área com um status (verde, amarelo ou vermelho), e recebe um mapa visual em formato de fluxograma com análise diagnóstica. O objetivo é gerar um choque de realidade que motiva a mudança.

---

## Ambiente de Desenvolvimento

- **Pasta do projeto:** `/Users/danilo/Documents/mapa-da-vida-14`
- **Porta do servidor:** `3001` (não 3000)
- **Node.js:** v22.x (obrigatório — v24 é incompatível)
- **Para rodar:** `npm run dev` dentro da pasta do projeto
- **Para parar processos travados:** `pkill -9 -f "next dev"`
- **Se o macOS travar o servidor:** `xattr -cr /Users/danilo/Documents/mapa-da-vida-14/`

---

## Stack Tecnológica

| Camada | Tecnologia | Versão |
|---|---|---|
| Framework | Next.js (App Router) | 14.2.35 |
| Linguagem | TypeScript | — |
| Estilização | Tailwind CSS | v3 |
| Componentes UI | shadcn/ui | — |
| Ícones | Lucide React | — |
| Formulários | Zod | — |
| Fluxograma | @xyflow/react (React Flow) | — |
| Backend / Banco | Supabase (PostgreSQL) | — |
| Autenticação | Supabase Auth | — |
| Hospedagem | Vercel (ainda não configurado) | — |

---

## Regras Gerais de Desenvolvimento

- Sempre usar **TypeScript**
- Sempre usar **App Router** do Next.js 14 (nunca Pages Router)
- Componentes devem ser **funcionais** com hooks
- Estilização **exclusivamente com Tailwind CSS** — nunca CSS inline ou arquivos .css separados
- Usar **shadcn/ui** para todos os elementos de UI (botões, inputs, modais, cards, etc.)
- Validação de formulários sempre com **Zod**
- Comunicação com banco de dados sempre via **Supabase client**
- Todo texto da interface em **português do Brasil**
- Código comentado em **português**
- Nunca instalar bibliotecas novas sem avisar e justificar
- **Next.js 14 específico:** `params` é síncrono (não use `await params`), `cookies()` não é async, usar `useFormState` de `react-dom` (não `useActionState` do React)
- Middleware usa `middleware.ts` (não `proxy.ts` — isso é Next.js 16+)
- Nunca rodar `npm run build` enquanto `npm run dev` está ativo

---

## Estrutura de Rotas

| Rota | Descrição |
|---|---|
| `/` | Landing page |
| `/auth/login` | Login |
| `/auth/cadastro` | Cadastro |
| `/auth/esqueci-senha` | Recuperação de senha |
| `/auth/redefinir-senha` | Redefinição de senha |
| `/auth/verificar-email` | Verificação de email |
| `/dashboard` | Lista de mapas do usuário |
| `/mapa/preparacao` | Tela de introdução antes de criar mapa (AHA moment) |
| `/mapa/novo` | Formulário em steps (3 pilares) para criar mapa |
| `/mapa/[id]` | Visualização do mapa com revelação animada |
| `/diagnostico/[id]` | Diagnóstico completo com observações |

---

## Estrutura de Pastas

```
/app
  /auth          → páginas de login e cadastro
  /dashboard     → listagem de mapas salvos
  /mapa
    /preparacao  → tela de introdução AHA moment
    /novo        → criação de novo mapa (step by step)
    /[id]        → visualização de mapa salvo
  /diagnostico
    /[id]        → diagnóstico completo
  /actions
    auth.ts      → server actions de autenticação
    mapa.ts      → server actions do mapa
/components
  /ui            → componentes shadcn/ui
  /mapa          → MapaFlow.tsx, RevelacaoMapa.tsx
/lib
  supabase.ts        → cliente Supabase (browser)
  supabase-server.ts → cliente Supabase (server)
  analise.ts         → lógica de análise diagnóstica
  utils.ts           → utilitários gerais
  validations.ts     → schemas Zod
/types
  index.ts       → tipos TypeScript globais
```

---

## Estrutura dos Pilares e Perguntas Reflexivas

| Pilar | Área | Pergunta Reflexiva |
|---|---|---|
| **Corpo** | Exercícios Físicos | Quando foi a última vez que você terminou um dia sentindo que seu corpo trabalhou para você — não contra você? |
| **Corpo** | Alimentação | Se alguém filmasse tudo que você comeu nos últimos 7 dias, você ficaria confortável assistindo? |
| **Corpo** | Hobbies | Você tem algo na sua vida que faz só porque gosta — sem precisar ser produtivo, sem gerar resultado? |
| **Mente** | Rede de Apoio | Se você recebesse uma notícia muito difícil hoje, quem você ligaria? Essa pessoa sabe o que está acontecendo na sua vida de verdade? |
| **Mente** | Trabalho | Como você se sente no domingo à noite pensando na semana que vem? Esse sentimento é exceção ou regra? |
| **Mente** | Finanças | Sem olhar para nenhum aplicativo agora: você sabe quanto entra, quanto sai e para onde vai o seu dinheiro todo mês? |
| **Espírito** | Propósito | Você consegue explicar, em uma frase, por que faz o que faz todos os dias? Essa resposta te energiza ou te pesa? |
| **Espírito** | Experiências | Quando foi a última vez que você fez algo pela primeira vez? Algo que te tirou da rotina e ficou na memória? |
| **Espírito** | Espiritualidade | Você tem alguma prática — qualquer que seja — que te reconecta com algo maior que a lista de tarefas do dia? |

### Status possíveis por área
- 🟢 **Verde** — Estou bem nessa área
- 🟡 **Amarelo** — Precisa de atenção
- 🔴 **Vermelho** — Precisa de mudança urgente

Campo de observação opcional com placeholder: *"O que está por trás dessa escolha?"*

---

## Modelo de Dados (Supabase)

### Tabela: `profiles`
| Campo | Tipo | Descrição |
|---|---|---|
| id | uuid | FK para auth.users |
| nome | text | Nome do usuário |
| criado_em | timestamp | Data de criação |

### Tabela: `mapas`
| Campo | Tipo | Descrição |
|---|---|---|
| id | uuid | PK |
| user_id | uuid | FK para profiles |
| titulo | text | Título do mapa (opcional) |
| criado_em | timestamp | Data de realização |

### Tabela: `areas`
| Campo | Tipo | Descrição |
|---|---|---|
| id | uuid | PK |
| mapa_id | uuid | FK para mapas |
| pilar | text | "corpo", "mente" ou "espirito" |
| area | text | Nome da área |
| status | text | "verde", "amarelo" ou "vermelho" |
| observacao | text | Anotação livre do usuário (opcional) |

---

## Fluxo do AHA Moment

### 1. Tela de Preparação (`/mapa/preparacao`)
Tela dark, impactante, sem distrações:
- Tag: "ANTES DE COMEÇAR"
- Título: "Esse não é um quiz. É uma pausa."
- Texto explicativo sobre honestidade e 10 minutos de atenção
- Frase final: "A maioria das pessoas nunca para para olhar para a própria vida dessa forma. Você está prestes a fazer isso."
- Botão: "Estou pronto"
- Botão de voltar discreto no canto superior esquerdo

### 2. Questionário (`/mapa/novo`)
- Um pilar por tela, com indicador de progresso (ex: 1 de 3) — cada tela exibe as 3 áreas do pilar
- Nome do pilar no topo
- Pergunta reflexiva em destaque
- Botões de status: Verde / Amarelo / Vermelho (com cores correspondentes)
- Campo de observação opcional com placeholder "O que está por trás dessa escolha?"
- Botão de voltar discreto

### 3. Revelação do Mapa (`/mapa/[id]`)
- Mapa React Flow aparece primeiro, full screen, sem texto
- Após 3 segundos ou ao rolar: análise diagnóstica aparece em fundo escuro
- Análise baseada no padrão de respostas (ver lib/analise.ts)
- Proporção de cores (🟢 N 🟡 N 🔴 N)
- Frase: "Agora você tem o diagnóstico. A pergunta que fica é: o que você vai fazer com ele?"
- Botão: "Definir meu objetivo" → leva ao dashboard por enquanto

### 4. Diagnóstico Completo (`/diagnostico/[id]`)
- Texto de análise diagnóstica no topo
- Proporção de cores
- Observações preenchidas pelo usuário, organizadas por área
- Apenas áreas com observação são exibidas

---

## Lógica de Análise Diagnóstica (lib/analise.ts)

| Padrão | Texto resumido |
|---|---|
| Maioria vermelha no Corpo | "Seu corpo está sendo colocado em último lugar há um tempo. Isso não aparece de uma hora para outra — mas quando aparece, aparece de uma vez." |
| Maioria vermelha na Mente | "A estrutura que deveria te sustentar está frágil. Trabalho pesando, relações superficiais, dinheiro sem controle — os três juntos criam um ciclo que consome mais energia do que você percebe." |
| Maioria vermelha no Espírito | "Você está funcionando. Mas não está vivendo. Sem propósito claro, sem experiências que renovam — a rotina vira só sobrevivência. E sobrevivência cansa." |
| Tudo vermelho | "Esse é o mapa de alguém no modo sobrevivência. Não é fraqueza — é o resultado de ignorar sinais por tempo demais. A boa notícia é que você parou para olhar. A maioria não para." |
| Maioria amarela | "Nada está em colapso. Mas nada está bem. Esse é o estado mais perigoso — porque não dói o suficiente para forçar uma mudança. Amarelo é o lugar onde as pessoas ficam presas por anos sem perceber." |
| Verde no Espírito, vermelho no resto | "Você sabe o que quer e tem clareza de propósito. O problema é que a estrutura ao redor — corpo, mente, rotina — não está colaborando. Clareza sem estrutura gera frustração." |
| Verde no Corpo, vermelho no resto | "Seu corpo está em dia, mas a mente e o espírito estão pagando o preço de algo. Energia física sem direção tem um limite." |
| Maioria verde | "Seu mapa está equilibrado. O próximo passo não é consertar — é construir consistência para que isso dure quando a vida apertar. Porque ela vai apertar." |

---

## Dashboard

- Listagem de mapas salvos com data de realização
- Cada card mostra: título, data, contadores de cores (🟢 N 🟡 N 🔴 N)
- Duas ações por card: "Ver Mapa" e "Ver Diagnóstico Completo"
- Botão "+ Novo Mapa" no topo direito

---

## Fases do Produto

### ✅ Fase 1 — MVP Web (atual)
- Autenticação completa (login, cadastro, recuperação de senha)
- Fluxo AHA moment (preparação → questionário → revelação → transição)
- Dashboard com listagem, ver mapa e diagnóstico completo
- CRUD de mapas

### 🔜 Fase 2 — Enriquecimento
- Definição de objetivos por área
- Gestão de tarefas vinculadas a cada objetivo
- Comparativo entre mapas ao longo do tempo

### 🔜 Fase 3 — Mobile
- React Native + Expo
- Mesmo Supabase como backend
- Reaproveitar lógica de negócio e tipos TypeScript

---

## Convenções de Frontend

### Hierarquia de responsabilidade
- **Páginas** (`/app`) — orquestram apenas. Buscam dados, passam props, definem layout. Sem lógica de negócio.
- **Componentes** (`/components`) — só renderizam. Recebem props, mostram UI. Sem chamadas ao Supabase.
- **Actions/Lib** (`/app/actions`, `/lib`) — toda lógica de negócio, validações e chamadas ao banco.

### Quando criar um componente
Só vira componente o que aparece em mais de um lugar. Exemplos:
- ✅ Card de mapa (dashboard + comparativos futuros)
- ✅ Indicador de status verde/amarelo/vermelho
- ✅ Header/navegação autenticada
- ❌ Tela de preparação (aparece só uma vez)
- ❌ Texto de diagnóstico (específico de cada contexto)

### Convenção de nomes
- `PaginaNome.tsx` → páginas específicas
- `ComponenteNome.tsx` → componentes reutilizáveis
- `useNome.ts` → hooks customizados
- `nomeFuncao.ts` → utilitários e actions

### Estado: onde guardar o quê
- `useState` → formulários, UI temporária (modais, toggles)
- Supabase → tudo que precisa persistir
- URL/params → identificadores de recursos (id do mapa)
- Server Components → dados que não mudam durante a sessão
- Nunca usar Redux ou Zustand — desnecessário para este projeto

### Padrão de commits
- `feat:` nova funcionalidade
- `fix:` correção de bug
- `style:` mudança visual sem alterar lógica
- `refactor:` reorganização de código sem mudar comportamento
- Exemplos:
  - `feat: dashboard com listagem de mapas`
  - `fix: botão voltar na tela de preparação`
  - `style: design system MindTrail aplicado`

### Regra de ouro para cada sessão
Antes de começar: qual página estou construindo? O que ela busca do Supabase? O que é reutilizável? Tem commit recente?

---

## Boas Práticas

- Sempre perguntar antes de refatorar algo que não foi pedido
- Preferir soluções simples a soluções elegantes quando o resultado for o mesmo
- Quando houver dúvida sobre comportamento esperado, perguntar antes de implementar
- Não gerar código para Fase 2 ou Fase 3 até ser solicitado
- Ao criar um novo componente, sempre criar o arquivo correspondente em `/components`
- **Sempre fazer commit após cada funcionalidade funcionando**
- Nunca misturar `npm run build` com `npm run dev` ao mesmo tempo
