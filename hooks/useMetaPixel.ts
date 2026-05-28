'use client'

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void
  }
}

export function useMetaPixel() {
  function trackEvent(eventName: string) {
    if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
      window.fbq('track', eventName)
    }
  }
  return { trackEvent }
}
