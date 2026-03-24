import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { AuthLayout } from '@/components/AuthLayout'
import { DashboardLista } from '@/components/DashboardLista'
import type { Mapa } from '@/types'

export default async function DashboardPage() {
  const supabase = createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const [{ data: profile }, { data: mapasRaw }] = await Promise.all([
    supabase.from('profiles').select('nome').eq('id', user.id).single(),
    supabase
      .from('mapas')
      .select('*, areas(*)')
      .eq('user_id', user.id)
      .order('criado_em', { ascending: false }),
  ])

  const mapas = (mapasRaw ?? []) as Mapa[]
  const nomeUsuario = profile?.nome ?? user.email ?? ''

  // Redireciona para preparação se o usuário ainda não tem nenhum mapa
  if (mapas.length === 0) redirect('/mapa/preparacao')

  return (
    <AuthLayout titulo="Seus mapas" nomeUsuario={nomeUsuario}>
      <div className="mx-auto w-full max-w-2xl px-6 py-8 flex flex-col gap-6">
        {/* Banner Personal System */}
        <div
          className="flex items-center justify-between gap-4 px-5 py-4"
          style={{ backgroundColor: '#2A3F45', borderRadius: 12 }}
        >
          <div className="flex flex-col gap-0.5">
            <span
              className="text-xs font-semibold uppercase tracking-widest"
              style={{ color: '#57AA8F' }}
            >
              Personal System
            </span>
            <p className="font-semibold text-[15px] leading-snug" style={{ color: '#EDF2EF' }}>
              Transforme seu diagnóstico em ação
            </p>
            <p className="text-xs mt-0.5" style={{ color: '#a8c4bc' }}>
              4 semanas para construir seu sistema pessoal
            </p>
          </div>
          <button
            className="shrink-0 text-sm font-medium text-white px-4 py-2 transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#57AA8F', borderRadius: 8 }}
          >
            Conhecer →
          </button>
        </div>

        {/* Lista de mapas */}
        <DashboardLista mapas={mapas} />
      </div>
    </AuthLayout>
  )
}
