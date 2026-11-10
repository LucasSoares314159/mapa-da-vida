'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BarChart3, BookOpen, CircleCheck, Map, Target, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

// Menu inferior do celular (no computador, a Sidebar). Fica no fluxo do layout,
// como último filho do flex-col, e não em `fixed`: assim nunca cobre o fim da
// página e nenhuma tela precisa reservar padding para ele.

type Aba = {
  href: string
  label: string
  icone: LucideIcon
  ativa: (pathname: string) => boolean
}

const ABAS: Aba[] = [
  {
    href: '/habitos',
    label: 'Hábitos',
    icone: CircleCheck,
    ativa: (p) => p.startsWith('/habitos') && !p.startsWith('/habitos/progresso'),
  },
  { href: '/habitos/progresso', label: 'Progresso', icone: BarChart3, ativa: (p) => p.startsWith('/habitos/progresso') },
  { href: '/content', label: 'Trilha', icone: BookOpen, ativa: (p) => p.startsWith('/content') },
  { href: '/objetivos', label: 'Objetivos', icone: Target, ativa: (p) => p.startsWith('/objetivos') },
  {
    href: '/dashboard',
    label: 'Mapa',
    icone: Map,
    ativa: (p) => p.startsWith('/dashboard') || p.startsWith('/mapa') || p.startsWith('/diagnostico'),
  },
]

export function NavInferior() {
  const pathname = usePathname()
  // Aba tocada cuja tela ainda não chegou. Acende no toque, antes da resposta do
  // servidor: sem isso, com a rede lenta, o toque parecia não ter funcionado.
  const [pendente, setPendente] = useState<string | null>(null)

  useEffect(() => {
    setPendente(null)
  }, [pathname])

  return (
    <nav
      aria-label="Menu principal"
      className="shrink-0 border-t-linha border-mt-border bg-white pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      <ul className="grid grid-cols-5">
        {ABAS.map(({ href, label, icone: Icone, ativa }) => {
          const atual = pendente ? pendente === href : ativa(pathname)
          const carregando = pendente === href
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={ativa(pathname) ? 'page' : undefined}
                onClick={() => {
                  if (!ativa(pathname)) setPendente(href)
                }}
                className="group flex min-h-14 flex-col items-center justify-center gap-1 pb-1.5 pt-2 focus-visible:outline focus-visible:outline-[3px] focus-visible:-outline-offset-[3px] focus-visible:outline-mt-green-dark"
              >
                <span
                  className={cn(
                    'flex h-7 w-14 items-center justify-center rounded-full transition-[background-color,transform] duration-150 group-active:scale-90 group-active:bg-mt-green-sup motion-reduce:transition-none',
                    atual && 'bg-mt-green-sup',
                    carregando && 'animate-pulse motion-reduce:animate-none'
                  )}
                >
                  <Icone className={cn('size-5', atual ? 'text-mt-green-dark' : 'text-mt-apoio')} strokeWidth={1.9} aria-hidden />
                </span>
                <span className={cn('text-xs', atual ? 'font-bold text-mt-green-dark' : 'font-medium text-mt-apoio')}>
                  {label}
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
