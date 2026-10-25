import Link from 'next/link'

// 404 do funil. Sem menu, como o resto do quiz, mas com uma saida: quem chegou
// de um link velho ou de um slug desligado deve conseguir ver a oferta.

export default function QuizNaoEncontrado() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-mt-off-white px-6">
      <div className="w-full max-w-md text-center">
        <h1 className="font-heading text-2xl font-bold text-mt-black">
          Este diagnóstico não está disponível.
        </h1>
        <p className="mt-4 text-base leading-7 text-mt-muted">
          O link pode ter expirado ou mudado de endereço.
        </p>
        <Link
          href="/trilha"
          className="mt-8 inline-block rounded-xl bg-mt-green px-8 py-4 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-mt-green-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mt-green focus-visible:ring-offset-2"
        >
          Conhecer a Trilha
        </Link>
      </div>
    </main>
  )
}
