'use client'

import { useEffect, useState, useSyncExternalStore } from 'react'

// Estado da instalação do app (PWA), compartilhado pelo convite da tela de hábitos
// e pelo item "Instalar o app" do menu "Mais".
//
// O Chrome dispara `beforeinstallprompt` uma vez por carregamento de página, e não
// necessariamente na tela onde o convite está. Por isso o evento é capturado por
// `escutarPedidoDeInstalacao()`, chamado no AuthLayout (toda tela autenticada), e
// guardado aqui no módulo: quem montar depois, numa navegação do cliente, ainda o
// encontra.

type EventoInstalacao = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> }

let eventoGuardado: EventoInstalacao | null = null
const ouvintes = new Set<() => void>()

function avisar() {
  ouvintes.forEach((f) => f())
}

let escutando = false
export function escutarPedidoDeInstalacao() {
  if (escutando || typeof window === 'undefined') return
  escutando = true
  window.addEventListener('beforeinstallprompt', (e) => {
    // Sem isso o Chrome mostra a própria barra; o convite e o menu cuidam disso.
    e.preventDefault()
    eventoGuardado = e as EventoInstalacao
    avisar()
  })
  window.addEventListener('appinstalled', () => {
    eventoGuardado = null
    avisar()
  })
}

function assinar(f: () => void) {
  ouvintes.add(f)
  return () => {
    ouvintes.delete(f)
  }
}

export type Plataforma = 'ios' | 'android' | 'outro'

function detectarPlataforma(): Plataforma {
  const ua = navigator.userAgent
  // iPad recente se apresenta como Mac; o toque denuncia.
  if (/iPhone|iPad|iPod/i.test(ua) || (/Macintosh/i.test(ua) && navigator.maxTouchPoints > 1)) return 'ios'
  if (/Android/i.test(ua)) return 'android'
  return 'outro'
}

function estaInstalado(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  )
}

export function useInstalacaoApp() {
  const evento = useSyncExternalStore(
    assinar,
    () => eventoGuardado,
    () => null
  )
  // Só no cliente: no servidor não há navegador para detectar.
  const [plataforma, setPlataforma] = useState<Plataforma | null>(null)
  const [instalado, setInstalado] = useState(true)

  useEffect(() => {
    setPlataforma(detectarPlataforma())
    setInstalado(estaInstalado())
  }, [])

  /** Abre o diálogo nativo do Chrome. Devolve false quando não há diálogo (aí mostre o passo a passo). */
  async function abrirDialogoNativo(): Promise<boolean> {
    if (!evento) return false
    await evento.prompt()
    const { outcome } = await evento.userChoice
    // O evento só serve uma vez.
    eventoGuardado = null
    avisar()
    if (outcome === 'accepted') setInstalado(true)
    return true
  }

  return {
    plataforma,
    instalado,
    temDialogoNativo: !!evento,
    // Celular sempre pode instalar (diálogo nativo ou passo a passo); no computador,
    // só se o navegador oferecer o diálogo.
    podeInstalar: !instalado && (plataforma === 'ios' || plataforma === 'android' || !!evento),
    abrirDialogoNativo,
  }
}
