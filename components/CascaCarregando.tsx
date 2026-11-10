import { Header } from './Header'
import { NavInferior } from './NavInferior'
import { Sidebar } from './Sidebar'

type Props = {
  /** Título do Header, quando a rota já o conhece; sem ele, um esqueleto. */
  titulo?: string
  children: React.ReactNode
}

// Moldura dos `loading.tsx` das telas com AuthLayout. O AuthLayout é montado por
// cada página, não por um layout de rota: sem esta casca, a tela de carregamento
// mostraria só o esqueleto, e o Header e o menu inferior sumiriam e voltariam a
// cada troca de tela. Com ela, o toque numa aba acende a aba de destino na hora
// (o NavInferior lê o pathname novo) e só o miolo espera o servidor.
export function CascaCarregando({ titulo, children }: Props) {
  return (
    <div className="flex h-dvh overflow-hidden">
      <div className="hidden h-dvh lg:flex">
        <Sidebar />
      </div>

      <div className="flex flex-1 flex-col overflow-hidden bg-mt-off-white">
        <Header
          titulo={titulo ?? <span className="block h-5 w-40 animate-pulse rounded-elemento bg-mt-border/50" />}
          nomeUsuario=""
        />
        <main className="flex-1 overflow-y-auto" aria-busy="true">
          {children}
        </main>
        <NavInferior />
      </div>
    </div>
  )
}
