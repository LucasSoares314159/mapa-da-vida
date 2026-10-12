/**
 * Materiais de apoio da Trilha — quadros interativos (Excalidraw) que
 * acompanham as aulas.
 *
 * Substituiu `lib/lives.ts` em outubro/2026: a seção era um compilado de
 * material de apoio, não uma trilha de aulas, então o catálogo deixou de
 * carregar duração e vídeo. As 3 lives antigas e seus links (Canva, podcast)
 * estão recuperáveis no git.
 *
 * Catálogo estático, como `MODULOS` — editar material exige commit e deploy.
 */
export type MaterialApoio = {
  id: string
  titulo: string
  /** URL do quadro. Validada contra a allowlist em `lib/conteudo-modulos.ts`. */
  quadroUrl: string
}

export const MATERIAIS: MaterialApoio[] = [
  {
    id: 'material-01',
    titulo: 'Material 01 — Sistema de Objetivos vs Sistema de Organização Pessoal',
    quadroUrl: 'https://link.excalidraw.com/readonly/XIXRBGN7uvNs2YC5iFvR',
  },
  {
    id: 'material-02',
    titulo: 'Material 02 — O Segredo da Consistência',
    quadroUrl: 'https://link.excalidraw.com/readonly/V8IBfsX2AzzQYE2aVflc',
  },
]

export function getMaterial(id: string): MaterialApoio | undefined {
  return MATERIAIS.find((m) => m.id === id)
}
