export type Modulo = {
  id: string
  titulo: string
  duracao: string
  videoId?: string
}

export const MODULOS: Modulo[] = [
  { id: 'modulo-0', titulo: 'Módulo 0 — Prefácio', duracao: '02:45', videoId: 'DyTxUyH9fkE' },
  { id: 'modulo-1', titulo: 'Módulo 1 — Mínima Organização Viável', duracao: '12:30', videoId: 'tO3nKRN3PYQ' },
  { id: 'modulo-2', titulo: 'Módulo 2 — Definindo Seu Momento de Vida', duracao: '19:17', videoId: 'a2rD2rS2ILU' },
  { id: 'modulo-3', titulo: 'Módulo 3 — Mapa da Vida', duracao: '05:09', videoId: '1hEpXT2PepA' },
  { id: 'modulo-4', titulo: 'Módulo 4 — Rotina vs Projetos', duracao: '10:37', videoId: '8S5I2rd8t-Q' },
  { id: 'modulo-5', titulo: 'Módulo 5 — Definindo Objetivos Coerentes', duracao: '15:01', videoId: 'UD893jKVCWw' },
  { id: 'modulo-6', titulo: 'Módulo 6 — Sistema de Objetivos', duracao: '30:00' },
  { id: 'modulo-7', titulo: 'Módulo 7 — Sistema de Organização Pessoal', duracao: '1:30:00' },
  { id: 'modulo-8', titulo: 'Módulo 8 — O Segredo da Consistência', duracao: '15:00' },
]

export function getModulo(id: string): Modulo | undefined {
  return MODULOS.find((m) => m.id === id)
}
