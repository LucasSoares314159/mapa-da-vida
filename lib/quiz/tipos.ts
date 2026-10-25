// Tipos do funil de quiz. Um quiz é inteiramente descrito por um ConfigQuiz —
// criar o quiz 2 é copiar um arquivo de config, nunca escrever componente.

/** As três dimensões de dificuldade medidas pela pontuação. */
export type Dimensao = 'A' | 'B' | 'C'

/**
 * Perfil atribuído ao fim do quiz. 'geral' é o Resultado Alternativo —
 * Análise Geral: não é um quarto perfil, é a ausência de predominância.
 */
export type Perfil = Dimensao | 'geral'

export type Pontos = Record<Dimensao, number>

/**
 * Quanto uma opção soma a cada dimensão. Uma opção pode somar a mais de uma
 * (Q1-C soma C+1 e B+1) ou a nenhuma (todas as de Q2, e as opções "saudáveis"
 * de Q3/Q4) — peso ausente é zero, nunca precisa ser escrito.
 */
export type Peso = Partial<Record<Dimensao, number>>

export type Opcao = {
  /** 'A' | 'B' | 'C' | 'D' — a letra que aparece na tela. */
  id: string
  texto: string
  peso: Peso
}

export type Pergunta = {
  id: string
  /** Linhas de contexto antes do enunciado, quando a tela tem. */
  contexto?: string[]
  enunciado: string
  /** Linha auxiliar entre enunciado e opções ("Qual destas situações..."). */
  apoio?: string
  opcoes: Opcao[]
  rotuloBotao: string
}

/**
 * Um item de conteudo: texto corrido, ou um grupo de frases curtas que deve
 * ser lido como lista.
 *
 * Os docs do quiz escrevem sequencias como "Comprou uma agenda." / "Baixou
 * aplicativos." / "Fez listas." como paragrafos de uma linha cada — bom para
 * cadencia de locucao na VSL, pessimo para leitura em tela: vira uma coluna
 * de linhas soltas sem hierarquia. Agrupar essas frases num array as marca
 * como lista sem reescrever uma unica palavra do texto aprovado.
 */
export type Paragrafo = string | string[]

/** Tela de copy sem pergunta — telas 01 e 05 dos docs. */
export type Interstituicao = {
  id: string
  titulo?: string
  paragrafos: Paragrafo[]
  rotuloBotao: string
}

export type ResultadoPerfil = {
  titulo: string
  paragrafos: Paragrafo[]
  rotuloBotao: string
}

export type ProviderVsl = 'vturb' | 'html5'

/**
 * Bloco de garantia abaixo do CTA da VSL.
 *
 * É prova de remoção de risco — a razão de existir é tirar o medo da decisão
 * de compra —, então ganha destaque proprio (selo + headline + reforço) em vez
 * de uma linha apagada no rodapé. Opcional: um quiz sem garantia declarada
 * simplesmente não mostra o bloco.
 */
export type GarantiaVsl = {
  /** Caminho do selo em /public (ex. /quiz/selo-garantia-7-dias.png). Vazio esconde o selo. */
  selo?: string
  /** Rótulo pequeno acima da headline, em maiúsculas. */
  eyebrow: string
  /** Headline do bloco. **negrito** e *itálico* são renderizados. */
  titulo: string
  /** Parágrafos de reforço. */
  texto: string[]
}

export type ConfigVsl = {
  provider: ProviderVsl
  /**
   * Identificador do vídeo no provider. Vazio desliga o player e mostra o CTA
   * de imediato — é o estado em que um quiz nasce, antes de o vídeo existir.
   */
  videoId: string
  /** Conta/player da VTurb, quando o provider exige (ver configs/quiz-1.ts). */
  contaId?: string
  /**
   * Frase curta acima do player, estilo direct-response — nunca um título com
   * subtítulo. A tela da VSL é para assistir, não para ler: qualquer bloco de
   * texto competindo com o vídeo é atenção tirada dele.
   */
  chamada: string
  /** Segundos de reprodução até o botão de compra aparecer. */
  ctaAtSeconds: number
  rotuloCta: string
  /** Texto curto abaixo do botão (preço). A garantia tem bloco próprio. */
  apoioCta?: string
  /** Bloco de garantia destacado abaixo do CTA. Ausente, não aparece. */
  garantia?: GarantiaVsl
}

/**
 * Limiares da classificação. Ficam na config, não no motor: são "hipóteses
 * operacionais" segundo os docs, e devem poder ser recalibrados por quiz sem
 * tocar na lógica.
 */
export type RegrasClassificacao = {
  /** Pontuação mínima do líder para haver perfil. Abaixo disso, Análise Geral. */
  minimoParaAtribuir: number
  /** Vantagem sobre o segundo que dispensa desempate. */
  vantagemSemDesempate: number
  /** Ids das perguntas consultadas no desempate, na ordem. */
  ordemDesempate: string[]
}

export type ConfigQuiz = {
  slug: string
  /**
   * Muda quando perguntas ou pesos mudam. Invalida rascunho em sessionStorage:
   * respostas gravadas sob outra versão não descrevem mais este quiz.
   */
  versao: number
  tituloPagina: string
  descricaoPagina: string
  abertura: Interstituicao
  perguntas: Pergunta[]
  /** Telas de copy no meio do fluxo, indexadas pela pergunta que as precede. */
  interstituicoes: { depoisDaPergunta: string; tela: Interstituicao }[]
  processando: { titulo: string; linhas: string[]; duracaoMs: number }
  resultados: Record<Perfil, ResultadoPerfil>
  regras: RegrasClassificacao
  vsl: ConfigVsl
}

/** Respostas acumuladas: id da pergunta → id da opção. */
export type Respostas = Record<string, string>

/** Como o perfil foi decidido. É o "regra utilizada" exigido pelos docs. */
export type RegraAplicada =
  | 'tudo_zero'
  | 'abaixo_do_minimo'
  | 'maior_com_vantagem'
  | 'desempate_pergunta'
  | 'empate_persistente'

export type ResultadoQuiz = {
  perfil: Perfil
  pontos: Pontos
  regra: RegraAplicada
  /** Id da pergunta que resolveu o desempate, quando foi o caso. */
  desempatadaPor?: string
}
