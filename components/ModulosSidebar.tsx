'use client'

import Link from 'next/link'
import { Check } from 'lucide-react'
import type { Modulo } from '@/lib/modulos'

type Props = {
  modulos: Modulo[]
  moduloAtualId: string
  concluidas: number[]
}

export function ModulosSidebar({ modulos, moduloAtualId, concluidas }: Props) {
  return (
    <aside
      className="hidden lg:flex h-fit w-[260px] shrink-0 flex-col rounded-xl overflow-hidden"
      style={{ border: '0.5px solid #c8d8d2', backgroundColor: '#ffffff' }}
    >
      <div className="px-5 py-4" style={{ backgroundColor: '#f0f7f5', borderBottom: '0.5px solid #c8d8d2' }}>
        <span className="text-sm font-semibold" style={{ color: '#1a2e29' }}>
          Módulos
        </span>
      </div>

      <div>
        {modulos.map((modulo, index) => {
          const concluida = concluidas.includes(index)
          const disponivel = !!modulo.link
          const atual = modulo.id === moduloAtualId

          const conteudo = (
            <div
              className="flex items-center gap-2.5 px-5 py-3"
              style={{
                backgroundColor: atual ? '#f0f7f5' : 'transparent',
                borderBottom: index < modulos.length - 1 ? '0.5px solid #c8d8d2' : 'none',
                opacity: !disponivel ? 0.5 : 1,
              }}
            >
              <span
                className="shrink-0 flex size-4 items-center justify-center rounded-full"
                style={
                  concluida
                    ? { backgroundColor: '#57AA8F' }
                    : { border: '1.5px solid #c8d8d2' }
                }
              >
                {concluida && <Check className="size-2.5 text-white" strokeWidth={3} />}
              </span>
              <span
                className="text-sm"
                style={{
                  color: atual ? '#1a2e29' : '#4a6b62',
                  fontWeight: atual ? 600 : 400,
                }}
              >
                {modulo.titulo}
              </span>
            </div>
          )

          if (!disponivel) {
            return <div key={modulo.id}>{conteudo}</div>
          }

          return (
            <Link key={modulo.id} href={`/content/modulo/${modulo.id}`} className="block transition-opacity hover:opacity-80">
              {conteudo}
            </Link>
          )
        })}
      </div>
    </aside>
  )
}
