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
      className="flex w-full items-center gap-2.5 rounded-full px-3 py-2.5 text-sm text-mt-apoio transition-colors duration-200 hover:bg-mt-off-white hover:text-mt-green-dark disabled:opacity-60"
    >
      <LogOut className="size-4 shrink-0" />
      {pending ? 'Saindo…' : 'Sair'}
    </button>
  )
}

export function Sidebar({ onClose, totalMembros }: Props) {
  const pathname = usePathname()

  return (
    <aside className="flex h-full w-[220px] shrink-0 flex-col border-r-linha border-mt-border bg-white">
      {/* Logo */}
      <div className="flex items-center gap-2.5 border-b-linha border-mt-border px-5 py-5">
        <div className="flex size-7 items-center justify-center rounded-lg bg-mt-green">
          <Map className="size-4 text-white" />
        </div>
        <span className="font-heading text-[17px] font-bold lowercase tracking-[-0.02em] text-mt-green-dark">Trilha</span>
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
                'flex items-center gap-2.5 rounded-full px-3 py-2.5 text-sm font-medium transition-colors duration-200',
                ativo
                  ? 'bg-mt-green-sup text-mt-green-dark'
                  : 'text-mt-apoio hover:bg-mt-off-white hover:text-mt-green-dark'
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
          className="mt-2 flex min-h-11 items-center justify-center gap-2 rounded-full bg-mt-green px-3 py-2.5 text-sm font-medium text-white transition-opacity duration-200 hover:opacity-90"
        >
          + Novo mapa
        </Link>
      </nav>

      {/* Footer */}
      <div className="border-t-linha border-mt-border p-3">
        {typeof totalMembros === 'number' && (
          <div className="flex items-center gap-2 px-3 py-2 text-xs text-mt-apoio">
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
