import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { QuizConversa } from '@/components/quiz/QuizConversa'
import { obterQuiz, slugsDeQuiz } from '@/lib/quiz/registro'

// Rota dinamica do funil. Slug desconhecido — ou quiz desligado pela flag —
// cai no not-found.tsx desta pasta.
//
// params e sincrono no Next 14: nao use await aqui.

type Props = { params: { slug: string } }

export function generateStaticParams() {
  return slugsDeQuiz().map((slug) => ({ slug }))
}

export function generateMetadata({ params }: Props): Metadata {
  const config = obterQuiz(params.slug)
  if (!config) return { title: 'Diagnóstico não encontrado' }

  return {
    title: config.tituloPagina,
    description: config.descricaoPagina,
    robots: { index: false, follow: false },
  }
}

export default function QuizPage({ params }: Props) {
  const config = obterQuiz(params.slug)
  if (!config) notFound()

  return <QuizConversa config={config} />
}
