import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import Link from 'next/link'

export const metadata = {
  title: 'MindTrail — Em breve',
  description: 'Estamos construindo algo novo.',
}

export default async function HomePage() {
  const supabase = createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    const { count } = await supabase
      .from('mapas')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)

    if (count && count > 0) {
      redirect('/objetivos')
    } else {
      redirect('/mapa/preparacao')
    }
  }

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6">
      <div className="text-center max-w-sm">
        <p className="text-sm uppercase tracking-widest text-zinc-500 mb-6">MindTrail</p>
        <h1 className="text-2xl font-bold mb-4">Estamos construindo algo novo.</h1>
        <p className="text-zinc-400 text-sm mb-8">
          Em breve este espaço vai contar toda a história.
        </p>
        <Link
          href="/lista-espera"
          className="text-sm text-zinc-400 underline underline-offset-4 hover:text-white transition-colors"
        >
          Entrar na lista de espera →
        </Link>
      </div>
    </main>
  )
}
