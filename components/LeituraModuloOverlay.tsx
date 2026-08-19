'use client'

import { useEffect } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { X } from 'lucide-react'
import type { Bloco } from '@/lib/conteudo-modulos'
import { ConteudoModulo } from './ConteudoModulo'

const TRANSICAO = { duration: 0.35, ease: [0.16, 1, 0.3, 1] } as const

type Props = {
  titulo: string
  blocos: Bloco[]
  aberto: boolean
  onFechar: () => void
}

// Overlay fullscreen com a experiência de leitura de uma newsletter: some tudo
// ao redor, só o texto importa. Fecha com X, clique fora ou Esc.
export function LeituraModuloOverlay({ titulo, blocos, aberto, onFechar }: Props) {
  useEffect(() => {
    if (!aberto) return

    function aoTeclar(e: KeyboardEvent) {
      if (e.key === 'Escape') onFechar()
    }

    document.addEventListener('keydown', aoTeclar)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', aoTeclar)
      document.body.style.overflow = ''
    }
  }, [aberto, onFechar])

  return (
    <AnimatePresence>
      {aberto && (
        <motion.div
          className="fixed inset-0 z-50 overflow-y-auto"
          style={{ backgroundColor: '#EDF2EF' }}
          role="dialog"
          aria-modal="true"
          aria-label={titulo}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={TRANSICAO}
        >
          <div
            className="sticky top-0 z-10 px-6 py-4"
            style={{ backgroundColor: '#EDF2EF', borderBottom: '0.5px solid #c8d8d2' }}
          >
            <button
              onClick={onFechar}
              className="flex size-9 items-center justify-center rounded-full transition-opacity hover:opacity-70"
              style={{ border: '1px solid #c8d8d2', color: '#1a2e29', backgroundColor: '#ffffff' }}
              aria-label="Fechar leitura"
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="px-6 py-12">
            <div className="mx-auto flex w-full max-w-[640px] flex-col gap-6">
              <h1 className="font-heading text-3xl font-bold leading-tight" style={{ color: '#1a2e29' }}>
                {titulo}
              </h1>
              <ConteudoModulo blocos={blocos} />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
