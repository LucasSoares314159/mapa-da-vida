import { clsx, type ClassValue } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

// O tailwind-merge só conhece a escala padrão do Tailwind. Sem registrar os
// tokens do tailwind.config.ts, ele lê `text-subtitulo` como cor e o descarta
// ao lado de `text-mt-green-dark` — o título sai no tamanho herdado, sem erro.
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [{ text: ['display', 'titulo', 'subtitulo', 'titulo-card', 'apoio', 'corpo', 'rotulo'] }],
      'border-w': [{ border: ['linha'] }],
      shadow: [{ shadow: ['mt-1', 'mt-2', 'mt-3'] }],
      rounded: [{ rounded: ['elemento', 'card', 'painel', 'badge'] }],
    },
    theme: {
      spacing: ['card', 'card-lg', 'painel', 'titulo', 'pilha', 'grade'],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
