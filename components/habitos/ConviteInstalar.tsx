'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { PassosInstalacao } from '@/components/PassosInstalacao'
import { useInstalacaoApp } from '@/hooks/useInstalacaoApp'

// Convite para instalar a plataforma como app, no topo da tela de hábitos (só no
// celular). Com o diálogo nativo do Chrome disponível, "Instalar" o abre; sem ele
// (Safari do iPhone, sempre; Chrome do Android, quando ainda não ofereceu), o botão
// mostra o passo a passo. Quem já abriu pelo app instalado não vê nada. O caminho
// fixo, para quem dispensou, é o item "Instalar o app" do menu "Mais".

const CHAVE_DISPENSA = 'pwa-convite-dispensado-em'
// Quem disse "agora não" volta a ver o convite depois de duas semanas.
const DIAS_ATE_REPETIR = 14

function dispensadoRecentemente(): boolean {
  try {
    const em = Number(window.localStorage.getItem(CHAVE_DISPENSA))
    return !!em && Date.now() - em < DIAS_ATE_REPETIR * 24 * 60 * 60 * 1000
  } catch {
    return false
  }
}

export function ConviteInstalar() {
  const { plataforma, podeInstalar, temDialogoNativo, abrirDialogoNativo } = useInstalacaoApp()
  const [dispensado, setDispensado] = useState(true)
  const [passosAbertos, setPassosAbertos] = useState(false)

  useEffect(() => {
    setDispensado(dispensadoRecentemente())
  }, [])

  function dispensar() {
    try {
      window.localStorage.setItem(CHAVE_DISPENSA, String(Date.now()))
    } catch {
      // Sem storage o convite só volta na próxima visita.
    }
    setDispensado(true)
  }

  async function instalar() {
    if (!(await abrirDialogoNativo())) setPassosAbertos(true)
  }

  // Só celular: no computador o convite nem aparece (lg:hidden abaixo).
  if (dispensado || !podeInstalar || (plataforma !== 'ios' && plataforma !== 'android')) return null

  return (
    <>
      <div className="card-mt mb-6 flex items-center gap-4 p-card lg:hidden">
        <Image src="/icons/icon-192.png" alt="" width={48} height={48} className="size-12 shrink-0 rounded-elemento" />
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <p className="text-base font-semibold leading-snug text-mt-green-dark">Instale a Trilha no celular</p>
          <p className="text-sm leading-snug text-mt-apoio">Abre direto nos seus hábitos, como um app.</p>
          <div className="mt-1 flex flex-wrap gap-2">
            <Button size="sm" onClick={instalar}>
              {temDialogoNativo ? 'Instalar' : 'Como instalar'}
            </Button>
            <Button size="sm" variant="ghost" onClick={dispensar}>
              Agora não
            </Button>
          </div>
        </div>
      </div>

      <PassosInstalacao aberto={passosAbertos} onFechar={() => setPassosAbertos(false)} plataforma={plataforma} />
    </>
  )
}
