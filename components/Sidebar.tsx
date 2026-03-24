'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, LogOut, Map } from 'lucide-react'
import { logout } from '@/app/actions/auth'
import { cn } from '@/lib/utils'

export function Sidebar() {
  const pathname = usePathname()
  const isDashboard = pathname === '/dashboard'

  return (
    <aside className="flex h-screen w-[220px] shrink-0 flex-col border-r bg-white" style={{ borderColor: '#c8d8d2', borderWidth: '0 0.5px 0 0' }}>
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5" style={{ borderBottom: '0.5px solid #c8d8d2' }}>
        <div className="flex size-7 items-center justify-center rounded-lg bg-mt-green">
          <Map className="size-4 text-white" />
        </div>
        <span className="font-heading text-[15px] font-medium text-mt-black">Mapa da Vida</span>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-1 p-3 flex-1">
        <Link
          href="/dashboard"
          className={cn(
            'flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-200',
            isDashboard
              ? 'bg-mt-off-white text-mt-green-dark'
              : 'text-mt-muted hover:bg-mt-off-white hover:text-mt-green-dark'
          )}
        >
          <Home className="size-4 shrink-0" />
          Início
        </Link>

        <Link
          href="/mapa/preparacao"
          className="mt-2 flex items-center justify-center gap-2 rounded-lg bg-mt-green px-3 py-2.5 text-sm font-medium text-white transition-colors duration-200 hover:bg-mt-green-dark"
        >
          + Novo mapa
        </Link>
      </nav>

      {/* Footer */}
      <div className="p-3" style={{ borderTop: '0.5px solid #c8d8d2' }}>
        <form action={logout}>
          <button
            type="submit"
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition-colors duration-200 hover:bg-mt-off-white"
            style={{ color: '#6f8f87' }}
          >
            <LogOut className="size-4 shrink-0" />
            Sair
          </button>
        </form>
      </div>
    </aside>
  )
}
