'use client'

import { Menu } from 'lucide-react'

type Props = {
  titulo: string
  nomeUsuario: string
  onMenuClick?: () => void
}

export function Header({ titulo, nomeUsuario, onMenuClick }: Props) {
  const inicial = nomeUsuario.trim().charAt(0).toUpperCase()

  return (
    <header
      className="flex h-14 shrink-0 items-center justify-between bg-white px-5"
      style={{ borderBottom: '0.5px solid #c8d8d2' }}
    >
      <div className="flex items-center gap-3">
        {/* Botão hamburguer — visível apenas em mobile */}
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="flex lg:hidden items-center justify-center rounded-lg transition-colors hover:bg-mt-off-white"
            style={{ width: 44, height: 44 }}
            aria-label="Abrir menu"
          >
            <Menu className="size-5" style={{ color: '#2A3F45' }} />
          </button>
        )}
        <h1 className="font-heading text-[15px] font-medium text-mt-black">{titulo}</h1>
      </div>

      <div
        className="flex size-8 items-center justify-center rounded-full text-sm font-medium"
        style={{ background: '#d4e4dc', color: '#2A3F45' }}
      >
        {inicial}
      </div>
    </header>
  )
}
