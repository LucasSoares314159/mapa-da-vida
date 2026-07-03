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
    titulo: 'Live 02 — Sistemas de Objetivos vs Sistemas de Organização Pessoal',
    duracao: '1:00:00',
    videoId: 'A0_cgaho9vc',
    materiais: [
      { label: 'Material da aula', url: 'https://canva.link/memldznrp6r60tg' },
    ],
  },
  {
    id: 'live-03',
    titulo: 'Live 3 - O Segredo da Consistência',
    duracao: '1:00:00',
    videoId: 'R4P7CPgAtBY',
    materiais: [
      { label: 'Podcast da aula', url: 'https://drive.google.com/file/d/1ICJ4ZIfXLzP9yYPCwABwDljMtup7L1la/view?usp=sharing' },
      { label: 'Material da aula', url: 'https://canva.link/g3sdhuxsu623g2p' },
    ],
  },
]

export function getLive(id: string): Live | undefined {
  return LIVES.find((l) => l.id === id)
}
