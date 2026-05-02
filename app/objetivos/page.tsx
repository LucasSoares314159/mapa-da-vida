import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { AuthLayout } from '@/components/AuthLayout'
import { ObjetivosLista } from '@/components/ObjetivosLista'
import type { Objetivo } from '@/types'

export const dynamic = 'force-dynamic'

export default async function ObjetivosPage() {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const [{ data: profile }, { data: objetivosRaw }, { data: rotinaRaw }] = await Promise.all([
    supabase.from('profiles').select('nome').eq('id', user.id).single(),
    supabase
      .from('objetivos')
      .select('*')
      .eq('user_id', user.id)
      .neq('status', 'arquivado')
      .order('criado_em', { ascending: false }),
    supabase
      .from('rotinas')
      .select('percentual_livre')
      .eq('user_id', user.id)
      .maybeSingle(),
  ])

  const nomeUsuario = profile?.nome ?? user.email ?? ''
  const objetivos = (objetivosRaw ?? []) as Objetivo[]

  const percentualLivre = rotinaRaw?.percentual_livre ?? 100
  const zona = percentualLivre >= 40 ? 'privilegio' : 'sacrificio'

  return (
    <AuthLayout titulo="Meus Objetivos" nomeUsuario={nomeUsuario}>
      <ObjetivosLista objetivos={objetivos} percentualLivre={percentualLivre} zona={zona} />
    </AuthLayout>
  )
}
