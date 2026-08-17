'use client'

import type { BaseArea } from '@/lib/blue-zones'
import type { NomeArea, StatusArea } from '@/types'

type Props = {
  nome: NomeArea
  status: StatusArea
  base: BaseArea
}

const COR_STATUS: Record<StatusArea, string> = {
  verde: '#57AA8F',
  amarelo: '#D4A843',
  vermelho: '#C05050',
}

export function AreaDestaqueOverlay({ nome, status, base }: Props) {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(42,63,69,0.55)', padding: 24 }}
    >
      <div
        className="flex w-full max-w-md flex-col gap-4 rounded-card bg-white px-8 py-7 shadow-xl"
        style={{ border: `1.5px solid ${COR_STATUS[status]}` }}
      >
        <div className="flex items-center gap-2">
          <span
            style={{
              width: 9,
              height: 9,
              borderRadius: '50%',
              backgroundColor: COR_STATUS[status],
              flexShrink: 0,
              display: 'inline-block',
            }}
          />
          <h3 className="text-base font-semibold text-mt-black">{nome}</h3>
        </div>

        <p className="text-[0.95rem] leading-relaxed text-mt-black">{base.fundamento}</p>

        <p
          className="text-sm leading-relaxed"
          style={{
            backgroundColor: 'rgba(87,170,143,0.08)',
            borderLeft: '2px solid #57AA8F',
            borderRadius: 6,
            padding: '14px 16px',
            color: '#2A3F45',
          }}
        >
          {base.destaque}
        </p>
      </div>
    </div>
  )
}
