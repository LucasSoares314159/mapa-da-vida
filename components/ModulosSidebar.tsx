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
      className="card-mt hidden lg:flex h-fit w-[260px] shrink-0 flex-col overflow-hidden"
    >
      <div className="px-5 py-4 bg-mt-green-sup border-b-linha border-mt-border">
        <h2 className="font-heading text-titulo-card font-medium text-mt-green-dark">Módulos</h2>
      </div>

      <div>
        {modulos.map((modulo, index) => {
          const concluida = concluidas.includes(index)
          const atual = modulo.id === moduloAtualId

          return (
            <Link
              key={modulo.id}
              href={`/content/modulo/${modulo.id}`}
              className="block transition-opacity hover:opacity-80"
            >
              <div
                className={`flex items-center gap-2.5 px-5 py-3 ${atual ? 'bg-mt-green-sup' : ''} ${
                  index < modulos.length - 1 ? 'border-b-linha border-mt-border' : ''
                }`}
              >
                <span
                  className={`flex size-4 shrink-0 items-center justify-center rounded-full ${
                    concluida ? 'bg-mt-green' : 'border-[1.5px] border-mt-border'
                  }`}
                >
                  {concluida && <Check className="size-2.5 text-white" strokeWidth={3} />}
                </span>
                <span
                  className={`text-sm ${atual ? 'font-semibold text-mt-green-dark' : 'font-normal text-mt-apoio'}`}
                >
                  {modulo.titulo}
                </span>
              </div>
            </Link>
          )
        })}
      </div>
    </aside>
  )
}
