export type Modulo = {
  id: string
  titulo: string
  duracao: string
  videoId?: string
  link?: string
}

export const MODULOS: Modulo[] = [
  { id: 'modulo-0', titulo: 'Módulo 0 — Prefácio', duracao: '02:45', videoId: 'DyTxUyH9fkE', link: 'https://app.notion.com/p/MD0-Pref-cio-373553ba5fd780eba964de6f7d9755d4?source=copy_link' },
  { id: 'modulo-1', titulo: 'Módulo 1 — Mínima Organização Viável', duracao: '12:30', videoId: 'tO3nKRN3PYQ', link: 'https://app.notion.com/p/MD1-M-nima-Organiza-o-Vi-vel-MOV-373553ba5fd780e78868e781497b31c2?source=copy_link' },
  { id: 'modulo-2', titulo: 'Módulo 2 — Definindo Seu Momento de Vida', duracao: '19:17', videoId: 'a2rD2rS2ILU', link: 'https://app.notion.com/p/MD2-Definindo-seu-Momento-de-Vida-373553ba5fd780f0aea8e7b7a77bb528?source=copy_link' },
  { id: 'modulo-3', titulo: 'Módulo 3 — Mapa da Vida', duracao: '05:09', videoId: '1hEpXT2PepA', link: 'https://app.notion.com/p/MD3-Mapa-da-Vida-373553ba5fd780e68ca6f49bfaecce6a?source=copy_link' },
  { id: 'modulo-4', titulo: 'Módulo 4 — Rotina vs Projetos', duracao: '10:37', videoId: '8S5I2rd8t-Q', link: 'https://app.notion.com/p/MD4-Rotina-vs-Projetos-373553ba5fd78042beb8cdc443accf47?source=copy_link' },
  { id: 'modulo-5', titulo: 'Módulo 5 — Definindo Objetivos Coerentes', duracao: '15:01', videoId: 'UD893jKVCWw', link: 'https://app.notion.com/p/MD5-Definindo-Objetivos-373553ba5fd78050b389e1e0c3512035?source=copy_link' },
  { id: 'modulo-6', titulo: 'Módulo 6 — Sistema de Objetivos', duracao: '30:00', link: 'https://app.notion.com/p/MD6-Sistema-de-Objetivos-38a553ba5fd7802c9e03e3cba9e19a35?source=copy_link' },
  { id: 'modulo-7', titulo: 'Módulo 7 — Sistema de Organização Pessoal', duracao: '1:30:00', link: 'https://app.notion.com/p/MD7-Sistema-de-Organiza-o-Pessoal-38a553ba5fd78098ae0bdb06cd007b07?source=copy_link' },
  { id: 'modulo-8', titulo: 'Módulo 8 — O Segredo da Consistência', duracao: '15:00', link: 'https://app.notion.com/p/MD8-O-Segredo-da-Consist-ncia-399553ba5fd780a8a08ac2781c8a0a99?source=copy_link' },
]

export function getModulo(id: string): Modulo | undefined {
  return MODULOS.find((m) => m.id === id)
}
