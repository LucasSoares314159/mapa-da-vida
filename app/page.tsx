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

  // Quem está logado entra direto na plataforma, tendo feito mapa ou não.
  if (user) {
    redirect('/content')
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-mt-green-dark px-6">
      <div className="max-w-md text-center">
        <p className="rotulo mb-6">MindTrail</p>
        <h1 className="mb-4 font-heading text-titulo font-medium text-mt-off-white [text-wrap:balance]">
          Estamos construindo algo novo.
        </h1>
        <p className="mb-8 font-editorial text-apoio lowercase text-mt-off-white/80">
          Em breve este espaço vai contar toda a história.
        </p>
        <Link
          href="/trilha"
          className="inline-flex min-h-11 items-center rounded-full bg-mt-green px-8 py-3 text-base font-medium text-white transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-mt-off-white"
        >
          Conhecer a Trilha
        </Link>
      </div>
    </main>
  )
}
