'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function AuthConfirmarPage() {
  const router = useRouter()

  useEffect(() => {
    const hash = window.location.hash.substring(1)
    const params = new URLSearchParams(hash)
    const accessToken = params.get('access_token')
    const refreshToken = params.get('refresh_token')
    const type = params.get('type')

    if (accessToken && refreshToken) {
      const supabase = createClient()
      supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken })
        .then(() => {
          if (type === 'recovery') {
            router.replace('/auth/redefinir-senha')
          } else {
            router.replace('/dashboard')
          }
        })
    } else {
      router.replace('/auth/login?error=auth')
    }
  }, [router])

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "#EDF2EF" }}>
      <p style={{ fontSize: 14, color: "#6f8f87", fontFamily: "DM Sans, sans-serif" }}>Verificando...</p>
    </div>
  )
}
