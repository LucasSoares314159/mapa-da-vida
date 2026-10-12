export type Modulo = {
  id: string
  titulo: string
  duracao: string
  videoId?: string
}

export const MODULOS: Modulo[] = [
  { id: 'modulo-0', titulo: 'Módulo 0 — Prefácio', duracao: '06:27', videoId: 'TYgikGM2HSY' },
  { id: 'modulo-1', titulo: 'Módulo 1 — Mínima Organização Viável', duracao: '12:30', videoId: 'tO3nKRN3PYQ' },
  { id: 'modulo-2', titulo: 'Módulo 2 — Definindo Seu Momento de Vida', duracao: '19:17', videoId: 'a2rD2rS2ILU' },
  { id: 'modulo-3', titulo: 'Módulo 3 — Mapa da Vida', duracao: '05:09', videoId: '1hEpXT2PepA' },
  { id: 'modulo-4', titulo: 'Módulo 4 — Rotina vs Projetos', duracao: '10:37', videoId: '8S5I2rd8t-Q' },
  { id: 'modulo-5', titulo: 'Módulo 5 — Definindo Objetivos Coerentes', duracao: '15:01', videoId: 'UD893jKVCWw' },
  {
    id: 'modulo-6',
    titulo: 'Módulo 6 — Sistema de Objetivos VS Sistema de Organização Pessoal',
    duracao: '24:22',
    videoId: '_sU_SV7NlEA',
  },
  { id: 'modulo-7', titulo: 'Módulo 7 — O Segredo da Consistência', duracao: '15:39', videoId: 'R53HFEZmQbg' },
]

export function getModulo(id: string): Modulo | undefined {
  return MODULOS.find((m) => m.id === id)
}

/** Duração de um módulo em segundos, a partir de "MM:SS" ou "H:MM:SS". */
function duracaoEmSegundos(d: string): number {
  const partes = d.split(':').map(Number)
  if (partes.length === 3) return partes[0] * 3600 + partes[1] * 60 + partes[2]
  if (partes.length === 2) return partes[0] * 60 + partes[1]
  return 0
}

/**
 * Duração total da trilha, somada de `MODULOS`.
 *
 * Era uma constante escrita à mão na Trilha e saiu de sincronia: anunciava
 * 3h47min somando tempos que já não eram os das aulas. Derivar da mesma fonte
 * dos módulos é o que impede o número exibido de divergir do conteúdo real.
 */
export function duracaoTotalTrilha(): string {
  const segundos = MODULOS.reduce((soma, m) => soma + duracaoEmSegundos(m.duracao), 0)
  const horas = Math.floor(segundos / 3600)
  const minutos = Math.round((segundos % 3600) / 60)

  return horas > 0 ? `${horas} h ${minutos} min` : `${minutos} min`
}
