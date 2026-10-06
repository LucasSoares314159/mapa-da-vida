import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { MapaConversa } from '@/components/mapa/MapaConversa'

/**
 * Fluxo conversacional do Mapa da Vida. Serve o primeiro acesso (quando é
 * obrigatório) e os remapeamentos — a diferença é só o que o fluxo pede:
 * nascimento e profissão entram apenas enquanto o perfil está incompleto.
 */
export default async function NovoMapaPage() {
  const supabase = createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const [{ data: profile }, { count }] = await Promise.all([
    supabase.from('profiles').select('data_nascimento, profissao').eq('id', user.id).single(),
    supabase.from('mapas').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
  ])

  return (
    <MapaConversa
      userId={user.id}
      ehPrimeiroMapa={!count}
      pedirPerfil={!profile?.data_nascimento || !profile?.profissao}
    />
  )
}
