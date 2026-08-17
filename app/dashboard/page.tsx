import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { contarMembros } from '@/lib/membros'
import { AuthLayout } from '@/components/AuthLayout'
import { DashboardLista } from '@/components/DashboardLista'
import { EvolucaoMapas } from '@/components/EvolucaoMapas'
import { NewsletterCTA } from '@/components/NewsletterCTA'
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

  // Redireciona para preparação se o usuário ainda não tem nenhum mapa
  if (mapas.length === 0) redirect('/mapa/preparacao')

  return (
    <AuthLayout titulo="Seus mapas" nomeUsuario={nomeUsuario} totalMembros={totalMembros}>
      <div className="mx-auto w-full max-w-2xl px-6 py-8 flex flex-col gap-6">
        {/* Banner do canal no YouTube */}
        <div
          className="flex items-center justify-between gap-4 px-5 py-4"
          style={{ backgroundColor: '#2A3F45', borderRadius: 12 }}
        >
          <div className="flex flex-col gap-0.5">
            <span
              className="text-xs font-semibold uppercase tracking-widest"
              style={{ color: '#57AA8F' }}
            >
              ▶️ MindTrail no YouTube
            </span>
            <p className="font-semibold text-[15px] leading-snug" style={{ color: '#EDF2EF' }}>
              Vídeos novos toda semana
            </p>
            <p className="text-xs mt-0.5" style={{ color: '#a8c4bc' }}>
              Como organizar a rotina, definir objetivos e manter consistência
            </p>
          </div>
          <a
            href="https://www.youtube.com/@mindtrail_co"
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 text-sm font-medium text-white px-4 py-2 no-underline transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#57AA8F', borderRadius: 8 }}
          >
            Inscrever-se →
          </a>
        </div>

        <NewsletterCTA utm_campaign="dashboard" variant="compact" />

        {/* Evolução do balanço ao longo do tempo */}
        <EvolucaoMapas mapas={mapas} />

        {/* Lista de mapas */}
        <DashboardLista mapas={mapas} />
      </div>
    </AuthLayout>
  )
}
