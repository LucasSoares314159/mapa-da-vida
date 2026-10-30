import type { ConfigQuiz, Respostas } from './tipos'

// Rascunho das respostas em sessionStorage.
//
// sessionStorage e nao localStorage, pelo mesmo motivo do Mapa: perder seis
// respostas num F5 e ruim, mas um rascunho de semanas atras reaparecendo para
// quem volta pelo anuncio seria pior — a pessoa veria um resultado que nao
// respondeu agora. A aba fechada zera, que e o comportamento desejado.
//
// Nada disso vai para o servidor: o quiz nao captura contato e nao grava
// resposta em banco.

type Rascunho = {
  versao: number
  indice: number
  respostas: Respostas
}

function chave(slug: string): string {
  return `quiz-rascunho:${slug}`
}

export function lerRascunho(config: ConfigQuiz): Rascunho | null {
  if (typeof window === 'undefined') return null

  try {
    const bruto = window.sessionStorage.getItem(chave(config.slug))
    if (!bruto) return null

    const dados = JSON.parse(bruto) as Rascunho

    // Config editada depois do rascunho: as respostas gravadas nao descrevem
    // mais este quiz, entao nao ha o que restaurar.
    if (dados.versao !== config.versao) {
      limparRascunho(config)
      return null
    }

    if (typeof dados.indice !== 'number' || typeof dados.respostas !== 'object') return null
    return dados
  } catch {
    // Modo privado, storage cheio ou JSON corrompido: seguir sem rascunho e
    // sempre melhor que derrubar o quiz.
    return null
  }
}

export function gravarRascunho(config: ConfigQuiz, indice: number, respostas: Respostas): void {
  if (typeof window === 'undefined') return

  try {
    const dados: Rascunho = { versao: config.versao, indice, respostas }
    window.sessionStorage.setItem(chave(config.slug), JSON.stringify(dados))
  } catch {
    // Sem rascunho a pessoa ainda consegue terminar o quiz.
  }
}

export function limparRascunho(config: ConfigQuiz): void {
  if (typeof window === 'undefined') return

  try {
    window.sessionStorage.removeItem(chave(config.slug))
  } catch {
    // Nada a fazer.
  }
}
