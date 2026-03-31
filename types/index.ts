export type StatusArea = 'verde' | 'amarelo' | 'vermelho'
export type NomePilar = 'corpo' | 'mente' | 'espirito'

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
