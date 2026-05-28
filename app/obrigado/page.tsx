'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { CheckCircle } from 'lucide-react'
import { useMetaPixel } from '@/hooks/useMetaPixel'

export default function ObrigadoPage() {
  const { trackEvent } = useMetaPixel()

  useEffect(() => {
    trackEvent('CompleteRegistration')
  }, [])

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-10">
          <CheckCircle className="w-14 h-14 text-emerald-500 mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Você está na lista!</h1>
          <p className="text-gray-600 mb-8">
            Assim que as vagas abrirem, você será o primeiro a saber. Fique de olho no seu email.
          </p>
          <Link
            href="/trilha"
            className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm"
          >
            Conhecer o programa
          </Link>
        </div>
      </div>
    </main>
  )
}
