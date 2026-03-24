import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function PreparacaoPage() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center px-6 py-16" style={{ backgroundColor: '#2A3F45' }}>
      <Link
        href="/dashboard"
        className="absolute left-6 top-6 flex items-center gap-1.5 text-sm transition-colors duration-200"
        style={{ color: '#6f8f87' }}
      >
        <ArrowLeft className="size-4" />
        Voltar
      </Link>
      <div className="w-full max-w-sm">
        <p className="mb-6 text-xs font-medium uppercase tracking-widest" style={{ color: '#6f8f87' }}>
          Antes de começar
        </p>

        <h1 className="mb-10 text-[1.75rem] font-semibold leading-snug text-white">
          Esse não é um quiz.
          <br />
          É uma pausa.
        </h1>

        <div className="space-y-6 text-[15px] leading-relaxed" style={{ color: '#a8c4bc' }}>
          <p>
            Você vai responder 9 perguntas sobre a sua vida — uma de cada vez, com honestidade.
            Não existe resposta certa. Existe só o que é real agora.
          </p>
          <p>
            Reserve 10 minutos. Feche outras abas. Responda pelo que é verdade hoje, não pelo que
            você quer que seja.
          </p>
          <p style={{ color: '#6f8f87' }}>
            A maioria das pessoas nunca para para olhar para a própria vida dessa forma. Você está
            prestes a fazer isso.
          </p>
        </div>

        <Button
          asChild
          className="mt-12 h-12 w-full bg-white text-zinc-950 hover:bg-zinc-100"
        >
          <Link href="/mapa/novo">Estou pronto</Link>
        </Button>
      </div>
    </main>
  )
}
