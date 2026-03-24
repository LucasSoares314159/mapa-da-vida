'use client'

import { useState } from 'react'
import { Sidebar } from './Sidebar'
import { Header } from './Header'

type Props = {
  titulo: string
  nomeUsuario: string
  children: React.ReactNode
}

export function AuthLayout({ titulo, nomeUsuario, children }: Props) {
  const [sidebarAberta, setSidebarAberta] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar — visível apenas em lg+ */}
      <div className="hidden lg:flex h-screen">
        <Sidebar />
      </div>

      {/* Drawer overlay — visível apenas em mobile quando aberto */}
      {sidebarAberta && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
          onClick={() => setSidebarAberta(false)}
        />
      )}

      {/* Drawer sidebar — mobile */}
      <div
        className={`fixed inset-y-0 left-0 z-50 lg:hidden transition-transform duration-300 ${
          sidebarAberta ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar onClose={() => setSidebarAberta(false)} />
      </div>

      {/* Conteúdo principal */}
      <div className="flex flex-1 flex-col overflow-hidden bg-mt-off-white">
        <Header
          titulo={titulo}
          nomeUsuario={nomeUsuario}
          onMenuClick={() => setSidebarAberta(true)}
        />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
