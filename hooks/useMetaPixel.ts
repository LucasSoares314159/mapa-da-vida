'use client'

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void
  }
}

export function useMetaPixel() {
  function trackEvent(eventName: string): Promise<void> {
    return new Promise((resolve) => {
      if (typeof window === 'undefined') { resolve(); return }

      if (typeof window.fbq === 'function') {
        window.fbq('track', eventName)
        resolve()
        return
      }

      // fbq ainda não carregou (afterInteractive) — aguarda até 2s
      let attempts = 0
      const interval = setInterval(() => {
        attempts++
        if (typeof window.fbq === 'function') {
          window.fbq('track', eventName)
          clearInterval(interval)
          resolve()
        } else if (attempts >= 40) {
          clearInterval(interval)
          resolve()
        }
      }, 50)
    })
  }

  return { trackEvent }
}
