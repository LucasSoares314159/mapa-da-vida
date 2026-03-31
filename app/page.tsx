import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { LandingPage } from '@/components/lp/LandingPage'

export const metadata = {
  title: 'Mapa da Vida — Diagnóstico gratuito das áreas da sua vida',
  description:
    'Responda 9 perguntas e receba um diagnóstico personalizado sobre o que está sustentando — e o que está consumindo — a sua energia.',
}

export default async function HomePage() {
  const supabase = createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) redirect('/dashboard')

  return <LandingPage />
}
