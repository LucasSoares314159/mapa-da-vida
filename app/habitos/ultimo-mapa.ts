import type { createServerSupabaseClient } from '@/lib/supabase-server'
import type { NomeArea, StatusArea } from '@/types'

// Cor de cada área no último Mapa da pessoa, para a bolinha da escolha de área
// no formulário de hábito. Conta isenta do gate pode não ter Mapa: devolve vazio
// e os chips aparecem sem bolinha.
export async function statusDoUltimoMapa(
  supabase: ReturnType<typeof createServerSupabaseClient>,
  userId: string
): Promise<Partial<Record<NomeArea, StatusArea>>> {
  const { data } = await supabase
    .from('mapas')
    .select('areas(area, status)')
    .eq('user_id', userId)
    .order('criado_em', { ascending: false })
    .limit(1)
    .maybeSingle()

  const areas = (data?.areas ?? []) as { area: NomeArea; status: StatusArea }[]
  return Object.fromEntries(areas.map((a) => [a.area, a.status]))
}
