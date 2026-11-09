'use client'

import { useState } from 'react'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { NavInferior } from './NavInferior'
import { MenuConta } from './MenuConta'

type Props = {
  titulo: string
  nomeUsuario: string
  /** Total de cadastrados, exibido no rodapé da sidebar. */
  totalMembros?: number | null
  children: React.ReactNode
}

// Computador: Sidebar fixa à esquerda. Celular: menu inferior (NavInferior) e o
// avatar do Header abre o menu "Mais" (MenuConta) com o que não coube nas abas.
//
// h-dvh, não h-screen: no iPhone, 100vh inclui a barra do Safari e o menu
// inferior nasceria escondido atrás dela.
export function AuthLayout({ titulo, nomeUsuario, totalMembros, children }: Props) {
  const [menuAberto, setMenuAberto] = useState(false)

  return (
    <div className="flex h-dvh overflow-hidden">
      {/* Sidebar — visível apenas em lg+ */}
      <div className="hidden h-dvh lg:flex">
        <Sidebar totalMembros={totalMembros} />
      </div>

      {/* Conteúdo principal */}
      <div className="flex flex-1 flex-col overflow-hidden bg-mt-off-white">
        <Header titulo={titulo} nomeUsuario={nomeUsuario} onAvatarClick={() => setMenuAberto(true)} />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
        <NavInferior />
      </div>

      <MenuConta
        aberto={menuAberto}
        onFechar={() => setMenuAberto(false)}
        nomeUsuario={nomeUsuario}
        totalMembros={totalMembros}
      />
    </div>
  )
}
