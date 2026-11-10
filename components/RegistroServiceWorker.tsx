'use client'

import { useEffect } from 'react'
import { escutarPedidoDeInstalacao } from '@/hooks/useInstalacaoApp'

// Registra o service worker do app instalável (public/sw.js) e passa a escutar o
// pedido de instalação do Chrome (ver hooks/useInstalacaoApp.ts). Só em produção: no
// `next dev` um service worker atrapalha o recarregamento e não serve para nada.
export function RegistroServiceWorker() {
  useEffect(() => {
    // Antes de tudo: o pedido de instalação do Chrome pode chegar em qualquer tela.
    escutarPedidoDeInstalacao()
    if (process.env.NODE_ENV !== 'production' || !('serviceWorker' in navigator)) return
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Sem service worker a plataforma funciona igual; só não fica instalável.
    })
  }, [])
  return null
}
