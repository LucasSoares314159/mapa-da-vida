import type {
  ConfigQuiz,
  Dimensao,
  Perfil,
  Pergunta,
  Pontos,
  RegraAplicada,
  Respostas,
  ResultadoQuiz,
} from './tipos'

// Motor de pontuação e classificação do quiz. Funções puras: nenhuma leitura de
// storage, nenhum acesso a rede, nenhum Date.now(). As mesmas respostas sempre
// produzem o mesmo resultado — reprodutibilidade é requisito explícito dos docs.

export const DIMENSOES: Dimensao[] = ['A', 'B', 'C']

export function pontosZerados(): Pontos {
  return { A: 0, B: 0, C: 0 }
}

function acharPergunta(config: ConfigQuiz, id: string): Pergunta | undefined {
  return config.perguntas.find((p) => p.id === id)
}

/**
 * Soma os pesos das opções escolhidas.
 *
 * Respostas órfãs — pergunta ou opção que não existe mais na config — são
 * ignoradas em silêncio: um rascunho de sessionStorage pode sobreviver a uma
 * edição da config, e derrubar o quiz por isso seria pior que pontuar sem ela.
 */
export function somarPontos(respostas: Respostas, config: ConfigQuiz): Pontos {
  const total = pontosZerados()

  for (const [idPergunta, idOpcao] of Object.entries(respostas)) {
    const opcao = acharPergunta(config, idPergunta)?.opcoes.find((o) => o.id === idOpcao)
    if (!opcao) continue

    for (const dimensao of DIMENSOES) {
      total[dimensao] += opcao.peso[dimensao] ?? 0
    }
  }

  return total
}

/** Dimensões ordenadas da maior para a menor pontuação. */
function ranquear(pontos: Pontos): Dimensao[] {
  return [...DIMENSOES].sort((a, b) => pontos[b] - pontos[a])
}

/**
 * Dimensões que ainda disputam o resultado: o líder e todas dentro da margem
 * de vantagem exigida.
 *
 * Não é "empate exato". O Exemplo 5 dos docs (A=5, B=2, C=4) é resolvido por
 * desempate embora A e C não estejam empatadas — o que dispara o desempate é a
 * vantagem insuficiente do líder, não a igualdade. Ler "empatadas" como
 * igualdade estrita faria aquele exemplo cair em Análise Geral, contrariando o
 * resultado que o próprio doc declara esperado.
 */
function candidatas(pontos: Pontos, vantagemSemDesempate: number): Dimensao[] {
  const ordem = ranquear(pontos)
  const lider = pontos[ordem[0]]
  return ordem.filter((d) => lider - pontos[d] < vantagemSemDesempate)
}

/**
 * Dimensões favorecidas pela resposta dada a uma pergunta — as que receberam
 * peso positivo dela. Uma opção neutra (peso vazio, como as de Q2) não favorece
 * ninguém e portanto nunca desempata.
 */
function favorecidasPor(
  idPergunta: string,
  respostas: Respostas,
  config: ConfigQuiz
): Dimensao[] {
  const idOpcao = respostas[idPergunta]
  if (!idOpcao) return []

  const opcao = acharPergunta(config, idPergunta)?.opcoes.find((o) => o.id === idOpcao)
  if (!opcao) return []

  return DIMENSOES.filter((d) => (opcao.peso[d] ?? 0) > 0)
}

/**
 * Atribui o perfil a partir das pontuações.
 *
 * A ordem das regras é a dos docs e não é intercambiável: o mínimo é verificado
 * ANTES do desempate, porque "os critérios de desempate não se aplicam quando a
 * maior pontuação é inferior a 4".
 */
export function classificar(
  pontos: Pontos,
  respostas: Respostas,
  config: ConfigQuiz
): ResultadoQuiz {
  const { minimoParaAtribuir, vantagemSemDesempate, ordemDesempate } = config.regras
  const ordem = ranquear(pontos)
  const lider = ordem[0]
  const pontuacaoLider = pontos[lider]

  const geral = (regra: RegraAplicada): ResultadoQuiz => ({ perfil: 'geral', pontos, regra })

  // Ninguém pontuou: nada a interpretar.
  if (pontuacaoLider === 0) return geral('tudo_zero')

  // Pontuação insuficiente para afirmar predominância.
  if (pontuacaoLider < minimoParaAtribuir) return geral('abaixo_do_minimo')

  const disputando = candidatas(pontos, vantagemSemDesempate)

  // Vantagem folgada: o líder é o perfil.
  if (disputando.length === 1) {
    return { perfil: lider, pontos, regra: 'maior_com_vantagem' }
  }

  // Desempate: a primeira pergunta da ordem que favoreça exatamente uma das
  // candidatas decide. Favorecer duas não resolve nada e segue para a próxima.
  for (const idPergunta of ordemDesempate) {
    const favorecidas = favorecidasPor(idPergunta, respostas, config).filter((d) =>
      disputando.includes(d)
    )

    if (favorecidas.length === 1) {
      return {
        perfil: favorecidas[0],
        pontos,
        regra: 'desempate_pergunta',
        desempatadaPor: idPergunta,
      }
    }
  }

  return geral('empate_persistente')
}

/** Atalho usado pela UI: soma e classifica numa chamada. */
export function avaliar(respostas: Respostas, config: ConfigQuiz): ResultadoQuiz {
  return classificar(somarPontos(respostas, config), respostas, config)
}

/** Quantas das perguntas pontuáveis do quiz já foram respondidas. */
export function respostasCompletas(respostas: Respostas, config: ConfigQuiz): number {
  return config.perguntas.filter((p) => respostas[p.id]).length
}

export function quizRespondidoPorCompleto(respostas: Respostas, config: ConfigQuiz): boolean {
  return respostasCompletas(respostas, config) === config.perguntas.length
}
