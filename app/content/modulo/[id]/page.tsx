import { notFound, redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { contarMembros } from '@/lib/membros'
import { linhasParaIndices } from '@/lib/progresso'
import { getConteudoModulo } from '@/lib/conteudo-modulos'
import { AuthLayout } from '@/components/AuthLayout'
import { ModuloAula } from '@/components/ModuloAula'
import { getModulo, MODULOS } from '@/lib/modulos'

export default async function ModuloPage({ params }: { params: { id: string } }) {
  const supabase = createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const modulo = getModulo(params.id)
  if (!modulo) notFound()

  const [{ data: profile }, { data: progresso }, totalMembros, blocos] = await Promise.all([
    supabase.from('profiles').select('nome').eq('id', user.id).single(),
    supabase.from('progresso_aulas').select('modulo_id').eq('user_id', user.id),
    contarMembros(),
    getConteudoModulo(params.id),
  ])

  const nomeUsuario = profile?.nome ?? user.email ?? ''
  const aulasConcluidas = linhasParaIndices(progresso ?? [])

  const index = MODULOS.findIndex((m) => m.id === params.id)
  const anterior = MODULOS[index - 1] ?? null
  const proximo = MODULOS[index + 1] ?? null

  return (
    <AuthLayout titulo={modulo.titulo} nomeUsuario={nomeUsuario} totalMembros={totalMembros}>
      <ModuloAula
        modulo={modulo}
        index={index + 1}
        total={MODULOS.length}
        anteriorId={anterior?.id ?? null}
        proximoId={proximo?.id ?? null}
        moduloIndex={index}
        aulasConcluidas={aulasConcluidas}
        blocos={blocos}
      />
    </AuthLayout>
  )
}
