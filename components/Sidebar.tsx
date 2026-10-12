'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useFormStatus } from 'react-dom'
import { LogOut, Map, Clock, Target, BookOpen, Compass, Users } from 'lucide-react'
import { logout } from '@/app/actions/auth'
import { cn } from '@/lib/utils'

type Props = {
  onClose?: () => void
  /** Total de cadastrados; ausente quando a contagem falha. */
  totalMembros?: number | null
}

// Ordem da navegação: a trilha primeiro, depois as ferramentas na sequência em
// que o método as usa (momento define a intenção → rotina mostra o espaço real →
// objetivos saem dos dois), e os mapas por último, como histórico.
const ITENS_NAV = [
  { href: '/content',   label: 'Conteúdo',        icone: BookOpen },
  { href: '/momento',   label: 'Momento de Vida', icone: Compass },
  { href: '/rotina',    label: 'Minha Rotina',    icone: Clock },
  { href: '/objetivos', label: 'Meus Objetivos',  icone: Target },
  { href: '/dashboard', label: 'Meus Mapas',      icone: Map },
] as const

function LogoutButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition-colors duration-200 hover:bg-mt-off-white disabled:opacity-60"
      style={{ color: '#6f8f87' }}
    >
      <LogOut className="size-4 shrink-0" />
      {pending ? 'Saindo…' : 'Sair'}
    </button>
  )
}

export function Sidebar({ onClose, totalMembros }: Props) {
  const pathname = usePathname()

  return (
    <aside className="flex h-full w-[220px] shrink-0 flex-col bg-white" style={{ borderRight: '0.5px solid #c8d8d2' }}>
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5" style={{ borderBottom: '0.5px solid #c8d8d2' }}>
        <div className="flex size-7 items-center justify-center rounded-lg bg-mt-green">
          <Map className="size-4 text-white" />
        </div>
        <span className="font-heading text-[15px] font-medium text-mt-black">Trilha</span>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-1 p-3 flex-1">
        {ITENS_NAV.map(({ href, label, icone: Icone }) => {
          const ativo = pathname === href

          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={cn(
                'flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-200',
                ativo
                  ? 'bg-mt-off-white text-mt-green-dark'
                  : 'text-mt-muted hover:bg-mt-off-white hover:text-mt-green-dark'
              )}
            >
              <Icone className="size-4 shrink-0" />
              {label}
            </Link>
          )
        })}

        <Link
          href="/mapa/preparacao"
          onClick={onClose}
          className="mt-2 flex items-center justify-center gap-2 rounded-lg bg-mt-green px-3 py-2.5 text-sm font-medium text-white transition-colors duration-200 hover:bg-mt-green-dark"
        >
          + Novo mapa
        </Link>
      </nav>

      {/* Footer */}
      <div className="p-3" style={{ borderTop: '0.5px solid #c8d8d2' }}>
        {typeof totalMembros === 'number' && (
          <div className="flex items-center gap-2 px-3 py-2 text-xs" style={{ color: '#6f8f87' }}>
            <Users className="size-3.5 shrink-0" />
            {totalMembros.toLocaleString('pt-BR')} {totalMembros === 1 ? 'membro' : 'membros'}
          </div>
        )}

        <form action={logout}>
          <LogoutButton />
        </form>
      </div>
    </aside>
  )
}
