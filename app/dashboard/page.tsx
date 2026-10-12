import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { contarMembros } from '@/lib/membros'
import { AuthLayout } from '@/components/AuthLayout'
import { DashboardLista } from '@/components/DashboardLista'
import { EvolucaoMapas } from '@/components/EvolucaoMapas'
import type { Mapa } from '@/types'

export default async function DashboardPage() {
  const supabase = createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const [{ data: profile }, { data: mapasRaw }, totalMembros] = await Promise.all([
    supabase.from('profiles').select('nome').eq('id', user.id).single(),
    supabase
      .from('mapas')
      .select('*, areas(*)')
      .eq('user_id', user.id)
      .order('criado_em', { ascending: false }),
    contarMembros(),
  ])

  const mapas = (mapasRaw ?? []) as Mapa[]
  const nomeUsuario = profile?.nome ?? user.email ?? ''

  return (
    <AuthLayout titulo="Seus mapas" nomeUsuario={nomeUsuario} totalMembros={totalMembros}>
      <div className="mx-auto w-full max-w-2xl px-6 py-8 flex flex-col gap-6">
        {/* Evolução do balanço ao longo do tempo */}
        <EvolucaoMapas mapas={mapas} />

        {/* Lista de mapas */}
        <DashboardLista mapas={mapas} />
      </div>
    </AuthLayout>
  )
}
