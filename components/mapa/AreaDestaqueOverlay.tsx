'use client'

import { cn } from '@/lib/utils'
import type { BaseArea } from '@/lib/blue-zones'
import type { NomeArea, StatusArea } from '@/types'

type Props = {
  nome: NomeArea
  status: StatusArea
  base: BaseArea
}

const BORDA_STATUS: Record<StatusArea, string> = {
  verde: 'border-mt-green',
  amarelo: 'border-mt-yellow',
  vermelho: 'border-mt-red',
}

const PONTO_STATUS: Record<StatusArea, string> = {
  verde: 'bg-mt-green',
  amarelo: 'bg-mt-yellow',
  vermelho: 'bg-mt-red',
}

export function AreaDestaqueOverlay({ nome, status, base }: Props) {
  return (
    <div className="pointer-events-none absolute inset-0 z-50 flex items-center justify-center bg-mt-green-dark/55 p-6">
      <div
        className={cn(
          'flex w-full max-w-md flex-col gap-4 rounded-card border-[1.5px] bg-mt-surface px-8 py-7 shadow-xl',
          BORDA_STATUS[status]
        )}
      >
        <div className="flex items-center gap-2">
          <span className={cn('inline-block size-2.5 shrink-0 rounded-full', PONTO_STATUS[status])} />
          <h3 className="text-base font-semibold text-mt-black">{nome}</h3>
        </div>

        <p className="text-[0.95rem] leading-relaxed text-mt-black">{base.fundamento}</p>

        <p className="rounded-md border-l-2 border-mt-green bg-mt-green/10 px-4 py-3.5 text-sm leading-relaxed text-mt-green-dark">
          {base.destaque}
        </p>
      </div>
    </div>
  )
}
