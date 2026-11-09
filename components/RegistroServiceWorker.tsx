'use client'

import { useEffect } from 'react'

// Registra o service worker do app instalável (public/sw.js). Só em produção: no
// `next dev` um service worker atrapalha o recarregamento e não serve para nada.
export function RegistroServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' || !('serviceWorker' in navigator)) return
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Sem service worker a plataforma funciona igual; só não fica instalável.
    })
  }, [])
  return null
}
