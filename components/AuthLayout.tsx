import { Sidebar } from './Sidebar'
import { Header } from './Header'

type Props = {
  titulo: string
  nomeUsuario: string
  children: React.ReactNode
}

export function AuthLayout({ titulo, nomeUsuario, children }: Props) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden bg-mt-off-white">
        <Header titulo={titulo} nomeUsuario={nomeUsuario} />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
