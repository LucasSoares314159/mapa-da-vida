'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Share, SquarePlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'

// Convite para instalar a plataforma como app, no topo da tela de hábitos (só no
// celular). Android: o Chrome oferece o próprio diálogo de instalação. iPhone: o
// Safari não tem esse diálogo, então explicamos o caminho pelo botão Compartilhar.
// Quem já abriu pelo app instalado não vê nada.

const CHAVE_DISPENSA = 'pwa-convite-dispensado-em'
// Quem disse "agora não" volta a ver o convite depois de duas semanas.
const DIAS_ATE_REPETIR = 14

type EventoInstalacao = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> }

function jaInstalado(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  )
}

function dispensadoRecentemente(): boolean {
  try {
    const em = Number(window.localStorage.getItem(CHAVE_DISPENSA))
    return !!em && Date.now() - em < DIAS_ATE_REPETIR * 24 * 60 * 60 * 1000
  } catch {
    return false
  }
}

export function ConviteInstalar() {
  const [modo, setModo] = useState<'android' | 'ios' | null>(null)
  const [evento, setEvento] = useState<EventoInstalacao | null>(null)
  const [passosAbertos, setPassosAbertos] = useState(false)

  useEffect(() => {
    if (jaInstalado() || dispensadoRecentemente()) return
    if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      setModo('ios')
      return
    }
    function aoOferecer(e: Event) {
      e.preventDefault()
      setEvento(e as EventoInstalacao)
      setModo('android')
    }
    window.addEventListener('beforeinstallprompt', aoOferecer)
    return () => window.removeEventListener('beforeinstallprompt', aoOferecer)
  }, [])

  function dispensar() {
    try {
      window.localStorage.setItem(CHAVE_DISPENSA, String(Date.now()))
    } catch {
      // Sem storage o convite só volta na próxima visita.
    }
    setModo(null)
  }

  async function instalar() {
    if (modo === 'ios') return setPassosAbertos(true)
    if (!evento) return
    await evento.prompt()
    const { outcome } = await evento.userChoice
    if (outcome === 'accepted') setModo(null)
  }

  if (!modo) return null

  return (
    <>
      <div className="card-mt mb-6 flex items-center gap-4 p-card lg:hidden">
        <Image src="/icons/icon-192.png" alt="" width={48} height={48} className="size-12 shrink-0 rounded-elemento" />
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <p className="text-base font-semibold leading-snug text-mt-green-dark">Instale a Trilha no celular</p>
          <p className="text-sm leading-snug text-mt-apoio">Abre direto nos seus hábitos, como um app.</p>
          <div className="mt-1 flex flex-wrap gap-2">
            <Button size="sm" onClick={instalar}>
              {modo === 'ios' ? 'Como instalar' : 'Instalar'}
            </Button>
            <Button size="sm" variant="ghost" onClick={dispensar}>
              Agora não
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={passosAbertos} onOpenChange={setPassosAbertos}>
        <DialogContent>
          <div className="flex flex-col gap-5 p-card-lg">
            <DialogTitle className="pr-8 text-subtitulo text-mt-green-dark">
              Instalar no <span className="normal-case">iPhone</span>
            </DialogTitle>
            <DialogDescription className="sr-only">Passo a passo para adicionar a Trilha à tela de início</DialogDescription>
            <ol className="flex flex-col gap-4 text-base text-mt-black">
              <li className="flex items-start gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-mt-green-sup text-sm font-bold text-mt-green-dark">1</span>
                <span>
                  No Safari, toque em <strong>Compartilhar</strong>{' '}
                  <Share className="inline size-4 align-text-bottom text-mt-green-dark" aria-hidden /> na barra de baixo.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-mt-green-sup text-sm font-bold text-mt-green-dark">2</span>
                <span>
                  Role e toque em <strong>Adicionar à Tela de Início</strong>{' '}
                  <SquarePlus className="inline size-4 align-text-bottom text-mt-green-dark" aria-hidden />.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-mt-green-sup text-sm font-bold text-mt-green-dark">3</span>
                <span>Toque em <strong>Adicionar</strong>. A Trilha aparece com os seus apps e abre direto nos hábitos.</span>
              </li>
            </ol>
            <Button onClick={() => setPassosAbertos(false)}>Entendi</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
