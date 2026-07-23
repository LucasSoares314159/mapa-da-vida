import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { AuthLayout } from '@/components/AuthLayout'
import { MomentoVida } from '@/components/MomentoVida'
import type { MomentoVida as MomentoVidaType } from '@/types'

export const dynamic = 'force-dynamic'

export default async function MomentoPage() {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { count: totalMapas } = await supabase
    .from('mapas')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)

  if (!totalMapas || totalMapas === 0) redirect('/mapa/preparacao')

  const [{ data: profile }, { data: momento }] = await Promise.all([
    supabase.from('profiles').select('nome').eq('id', user.id).single(),
    supabase
      .from('momentos_vida')
      .select('*')
      .eq('user_id', user.id)
      .eq('ativo', true)
      .maybeSingle(),
  ])

  const nomeUsuario = profile?.nome ?? user.email ?? ''

  return (
    <AuthLayout titulo="Meu Momento de Vida" nomeUsuario={nomeUsuario}>
      <MomentoVida momento={(momento as MomentoVidaType | null) ?? null} />
    </AuthLayout>
  )
}
