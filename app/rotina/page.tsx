import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import CalculadoraRotina from '@/components/CalculadoraRotina'
import type { InputRotina } from '@/lib/rotina'

export default async function PaginaRotina({
  searchParams,
}: {
  searchParams: { mapaId?: string }
}) {
  const supabase = createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const mapaId = searchParams.mapaId

  // Fetch user's existing rotina
  const { data: rotinaExistente } = await supabase
    .from('rotinas')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  // Fetch user's mapas for linking dropdown
  const { data: mapasUser } = await supabase
    .from('mapas')
    .select('id, titulo, criado_em')
    .eq('user_id', user.id)
    .order('criado_em', { ascending: false })

  const defaultValues: InputRotina & { mapaId?: string } | undefined = rotinaExistente
    ? {
        horasSono: rotinaExistente.horas_sono,
        horasTrabalho: rotinaExistente.horas_trabalho,
        horasBasicas: rotinaExistente.horas_basicas,
        diasTrabalho: rotinaExistente.dias_trabalho,
        horasTela: rotinaExistente.horas_tela ?? 2,
        mapaId: rotinaExistente.mapa_id,
      }
    : undefined

  return (
    <CalculadoraRotina
      defaultValues={defaultValues}
      mapas={mapasUser || []}
      mapaId={mapaId}
    />
  )
}
