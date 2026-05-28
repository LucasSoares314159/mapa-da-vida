'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { CheckCircle } from 'lucide-react'
import { useMetaPixel } from '@/hooks/useMetaPixel'
import { MetaPixelListaEspera } from '@/components/MetaPixelListaEspera'

export default function ObrigadoPage() {
  const { trackEvent } = useMetaPixel()

  useEffect(() => {
    trackEvent('CompleteRegistration')
  }, [])

  return (
    <main className="min-h-screen bg-mt-off-white flex items-center justify-center px-6">
      <MetaPixelListaEspera />
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-2xl border border-mt-border shadow-sm p-10">
          <CheckCircle className="w-14 h-14 text-mt-green mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-mt-black mb-3">Você está na lista!</h1>
          <p className="text-mt-muted mb-4">
            Assim que a data de início da próxima turma for definida, você será avisado por email e WhatsApp.
          </p>
          <Link
            href="/trilha"
            className="inline-block bg-mt-green hover:bg-mt-green-dark text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm"
          >
            Conhecer o programa
          </Link>
        </div>
      </div>
    </main>
  )
}
