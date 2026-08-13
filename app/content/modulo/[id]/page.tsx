import { notFound, redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { AuthLayout } from '@/components/AuthLayout'
import { ModuloAula } from '@/components/ModuloAula'
import { getModulo, MODULOS } from '@/lib/modulos'

export default async function ModuloPage({ params }: { params: { id: string } }) {
  const supabase = createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('nome, aulas_concluidas')
    .eq('id', user.id)
    .single()

  const nomeUsuario = profile?.nome ?? user.email ?? ''
  const aulasConcluidas: number[] = profile?.aulas_concluidas ?? []

  const modulo = getModulo(params.id)
  if (!modulo) notFound()

  const index = MODULOS.findIndex((m) => m.id === params.id)
  const anterior = MODULOS[index - 1] ?? null
  const proximo = MODULOS[index + 1] ?? null

  return (
    <AuthLayout titulo={modulo.titulo} nomeUsuario={nomeUsuario}>
      <ModuloAula
        modulo={modulo}
        index={index + 1}
        total={MODULOS.length}
        anteriorId={anterior?.link ? anterior.id : null}
        proximoId={proximo?.link ? proximo.id : null}
        moduloIndex={index}
        aulasConcluidas={aulasConcluidas}
      />
    </AuthLayout>
  )
}
