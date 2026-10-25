import type { ConfigQuiz } from './tipos'
import { quiz1 } from './configs/quiz-1'

// Catalogo de quizzes por slug. Adicionar um quiz e criar o arquivo de config
// e registra-lo aqui — nenhuma tela nova, nenhuma rota nova.

const QUIZZES: ConfigQuiz[] = [quiz1]

/** Flag de desligamento. Sem a variavel, o quiz fica ativo. */
export function quizAtivo(): boolean {
  return process.env.NEXT_PUBLIC_QUIZ_ATIVO !== 'false'
}

export function obterQuiz(slug: string): ConfigQuiz | null {
  if (!quizAtivo()) return null
  return QUIZZES.find((q) => q.slug === slug) ?? null
}

export function slugsDeQuiz(): string[] {
  return QUIZZES.map((q) => q.slug)
}
