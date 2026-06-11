export type Material = {
  label: string
  url: string
}

export type Live = {
  id: string
  titulo: string
  duracao: string
  videoId?: string
  materiais: Material[]
}

export const LIVES: Live[] = [
  {
    id: 'live-01',
    titulo: 'Live 01 — Apresentação do Programa',
    duracao: '1:00:00',
    videoId: undefined,
    materiais: [
      { label: 'Material da aula', url: 'https://canva.link/oszcmrwb2zzp9fo' },
    ],
  },
  {
    id: 'live-02',
    titulo: 'Live 02 — Sistemas de Objetivos Pessoais',
    duracao: '1:00:00',
    videoId: undefined,
    materiais: [],
  },
  {
    id: 'live-03',
    titulo: 'Live 03 — Consistência e Encerramento do Programa',
    duracao: '1:00:00',
    videoId: undefined,
    materiais: [],
  },
]

export function getLive(id: string): Live | undefined {
  return LIVES.find((l) => l.id === id)
}
