export type StatusArea = 'verde' | 'amarelo' | 'vermelho'
export type NomePilar = 'corpo' | 'mente' | 'espirito'

export type PrazoObjetivo = 'curto' | 'medio' | 'longo'
export type StatusObjetivo = 'ativo' | 'pausado' | 'concluido' | 'arquivado'
export type FrequenciaLembrete = 'semanal' | 'quinzenal' | 'mensal'

// --- Momento de Vida ---
// A camada de intenção que fica acima dos objetivos e da rotina: uma declaração
// honesta de qual fase o usuário está vivendo, que guia todo o resto.
export type EstacaoMomento = 'semear' | 'construir' | 'consolidar' | 'recuperar' | 'transicao'
export type DuracaoMomento = '3_meses' | '6_meses' | '1_ano'

export interface MomentoVida {
  id: string
  user_id: string
  estacao: EstacaoMomento
  frase: string
  duracao: DuracaoMomento
  data_revisao: string // date (YYYY-MM-DD): criado_em + duração
  ativo: boolean // apenas um momento ativo por usuário; os anteriores viram histórico
  ultimo_lembrete_em?: string | null
  criado_em: string
}

// Metadados de apresentação de cada estação (label, ícone/emoji, cor e frase de contexto).
// A cor sai da paleta MindTrail para harmonizar com os pilares e a Zona Sacrifício.
export const ESTACOES: Record<EstacaoMomento, {
  label: string
  emoji: string
  cor: string
  contexto: string
  placeholder: string
}> = {
  semear: {
    label: 'Semear',
    emoji: '🌱',
    cor: '#7BC49A',
    contexto: 'Você está começando algo, explorando, plantando o que ainda não deu fruto.',
    placeholder: 'Ex: experimentar caminhos novos sem cobrar resultado imediato',
  },
  construir: {
    label: 'Construir',
    emoji: '🏗️',
    cor: '#57AA8F',
    contexto: 'Você está em fase de crescer, produzir e avançar com força total.',
    placeholder: 'Ex: focar no trabalho, ser consistente e pensar no longo prazo',
  },
  consolidar: {
    label: 'Consolidar',
    emoji: '🧭',
    cor: '#6B7FD7',
    contexto: 'Você está estabilizando o que construiu, criando consistência e mantendo o ritmo.',
    placeholder: 'Ex: manter o que já funciona e criar rotina sustentável',
  },
  recuperar: {
    label: 'Recuperar',
    emoji: '🌾',
    cor: '#D4A843',
    contexto: 'Você está diminuindo o ritmo, cuidando de si e restaurando suas energias.',
    placeholder: 'Ex: diminuir o ritmo e focar na saúde',
  },
  transicao: {
    label: 'Transição',
    emoji: '🔄',
    cor: '#9B7FD4',
    contexto: 'Você está mudando de fase, reavaliando prioridades e redirecionando o rumo.',
    placeholder: 'Ex: reavaliar o que importa e decidir o próximo passo',
  },
}

export const DURACOES: Record<DuracaoMomento, { label: string; sublabel: string; meses: number }> = {
  '3_meses': { label: '3 meses', sublabel: 'fase curta e intensa', meses: 3 },
  '6_meses': { label: '6 meses', sublabel: 'fase de médio alcance', meses: 6 },
  '1_ano': { label: '1 ano', sublabel: 'uma virada longa', meses: 12 },
}

export interface Objetivo {
  id: string
  user_id: string
  texto: string
  pilar: NomePilar
  prazo: PrazoObjetivo
  status: StatusObjetivo
  data_alvo?: string | null
  frequencia_lembrete?: FrequenciaLembrete | null
  ultimo_lembrete_em?: string | null
  motivo?: string | null
  criado_em: string
  concluido_em?: string | null
}

export type NomeArea =
  | 'Exercícios Físicos'
  | 'Alimentação'
  | 'Hobbies'
  | 'Rede de Apoio'
  | 'Trabalho'
  | 'Finanças'
  | 'Propósito'
  | 'Experiências'
  | 'Espiritualidade'

export interface Area {
  id: string
  mapa_id: string
  pilar: NomePilar
  area: NomeArea
  status: StatusArea
  observacao?: string
}

export interface Mapa {
  id: string
  user_id: string
  titulo?: string
  criado_em: string
  areas?: Area[]
}

export interface Profile {
  id: string
  nome: string
  criado_em: string
}

export const PILARES: Record<NomePilar, { label: string; areas: NomeArea[]; perguntas: Record<NomeArea, string> }> = {
  corpo: {
    label: 'Corpo',
    areas: ['Exercícios Físicos', 'Alimentação', 'Hobbies'],
    perguntas: {
      'Exercícios Físicos': 'O quanto você sente que o seu corpo tem a mobilidade, força e resistência que você gostaria de ter para viver do jeito que quer hoje e no futuro?',
      'Alimentação': 'Se alguém filmasse tudo que você comeu nos últimos 7 dias, você ficaria confortável assistindo?',
      'Hobbies': 'Você tem algo na sua vida que faz só porque gosta — sem precisar ser produtivo, sem gerar resultado?',
    } as Record<NomeArea, string>,
  },
  mente: {
    label: 'Mente',
    areas: ['Rede de Apoio', 'Trabalho', 'Finanças'],
    perguntas: {
      'Rede de Apoio': 'Se você recebesse uma notícia muito difícil hoje, você teria para quem ligar? Teria mais de uma pessoa?',
      'Trabalho': 'Como você se sente no domingo à noite pensando na semana que vem? Esse sentimento é exceção ou regra?',
      'Finanças': 'Sem olhar para nenhum aplicativo agora: você sabe quanto entra, quanto sai e para onde vai o seu dinheiro todo mês?',
    } as Record<NomeArea, string>,
  },
  espirito: {
    label: 'Espírito',
    areas: ['Propósito', 'Experiências', 'Espiritualidade'],
    perguntas: {
      'Propósito': 'Você consegue explicar, em uma frase, por que faz o que faz todos os dias? Essa resposta te energiza ou te pesa?',
      'Experiências': 'Quando foi a última vez que você fez algo pela primeira vez? Algo que te tirou da rotina e ficou na memória?',
      'Espiritualidade': 'Você tem alguma prática — qualquer que seja — que te reconecta com algo maior que a lista de tarefas do dia?',
    } as Record<NomeArea, string>,
  },
}

export const COR_STATUS: Record<StatusArea, { bg: string; border: string; label: string }> = {
  verde: { bg: 'bg-green-100', border: 'border-green-500', label: 'Estou bem nessa área' },
  amarelo: { bg: 'bg-yellow-100', border: 'border-yellow-500', label: 'Precisa de atenção' },
  vermelho: { bg: 'bg-red-100', border: 'border-red-500', label: 'Precisa de mudança urgente' },
}
