import type { ConfigQuiz } from '../tipos'

/**
 * Quiz 1 — "Descubra por que você continua adiando seus objetivos."
 *
 * Perguntas, opções, pesos e textos de resultado vêm literalmente de
 * docs/REGRAS DE PONTUAÇÃO DO QUIZ.md e docs/[Lucas Soares] Quiz.md, que são a
 * fonte de verdade. Os docs são explícitos: não alterar a redação sem aprovação.
 *
 * Dois pontos que parecem erro de digitação e não são:
 *
 * - Todas as opções de q2 têm peso vazio. A pergunta identifica o desejo
 *   principal para segmentação e personalização, e os docs proíbem usá-la como
 *   critério de pontuação.
 * - q6-C ("manter uma rotina mesmo quando surgirem imprevistos") soma B+2, não
 *   C+2. Parece dimensão C por falar de rotina e imprevisto, mas a matriz a
 *   classifica como falha de sustentação, e o Exemplo 3 dos docs só fecha assim.
 */
/**
 * Segundo da VSL em que a oferta e apresentada (4:42). O botao de compra so
 * aparece quando a pessoa assiste ate aqui — em reproducao continua, sem contar
 * avanco manual nem o autoplay mudo (ver lib/quiz/progresso-vsl.ts). Se o video
 * for reeditado, medir de novo.
 */
export const SEGUNDO_DA_OFERTA_NA_VSL = 4 * 60 + 42

export const quiz1: ConfigQuiz = {
  slug: 'quiz-1',
  // 3: a abertura voltou ao fluxo (revisão de copy v2) e o índice posicional do
  // rascunho deslocou uma tela de novo. 2 foi quando a abertura saiu.
  versao: 3,
  tituloPagina: 'Descubra por que você continua adiando seus objetivos',
  descricaoPagina:
    'Responda a 6 perguntas rápidas e descubra o que pode estar fazendo você deixar seus objetivos pessoais sempre para depois.',

  // TELA 01 — abertura (landing). Sem mascote: a abertura voltou na revisão de
  // copy v2, mas a imagem priority (que pesava na entrada, pior no Android) não.
  // O quiz_start não sai aqui: só na primeira resposta (ver QuizConversa).
  abertura: {
    id: 'abertura',
    // *…* marca o destaque do título (Satoshi 700 em --verde, como o <em> do
    // H1 da LP /trilha). Só marcação: a redação é a do doc. TextoQuiz a remove.
    titulo: 'Você termina o dia cansado, mas *sente que não fez nada por você*?',
    paragrafos: [
      'Em 2 minutos, descubra o que está te fazendo adiar seus objetivos pessoais e qual é o primeiro passo pra sair disso.',
      '**6 perguntas rápidas · sem cadastro**',
    ],
    rotuloBotao: 'COMEÇAR MEU DIAGNÓSTICO',
  },

  perguntas: [
    // TELA 02
    {
      id: 'q1',
      enunciado: 'Como é a sua rotina hoje?',
      rotuloBotao: 'CONTINUAR',
      opcoes: [
        { id: 'A', texto: 'Só trabalho, o dia inteiro.', peso: { C: 2 } },
        { id: 'B', texto: 'Responsabilidades demais, sem tempo pra mim.', peso: { C: 2 } },
        { id: 'C', texto: 'Imprevisível, sempre surge alguma coisa.', peso: { C: 1, B: 1 } },
        { id: 'D', texto: 'Até tenho tempo livre, mas não aproveito.', peso: { B: 2 } },
      ],
    },
    // TELA 03 — não pontua
    {
      id: 'q2',
      contexto: [
        'É curioso como sempre encontramos tempo para as obrigações.',
        'Mas nem sempre para os nossos próprios objetivos.',
      ],
      enunciado: 'O que você mais gostaria de fazer, mas vive deixando para depois?',
      rotuloBotao: 'CONTINUAR',
      opcoes: [
        { id: 'A', texto: 'Cuidar da saúde, treinar e me alimentar melhor.', peso: {} },
        { id: 'B', texto: 'Tirar um projeto pessoal do papel.', peso: {} },
        { id: 'C', texto: 'Ler, estudar e desenvolver novas habilidades.', peso: {} },
        { id: 'D', texto: 'Ter mais tempo para mim, minha família e meus amigos.', peso: {} },
      ],
    },
    // TELA 04
    {
      id: 'q3',
      contexto: [
        'Imagine que amanhã você ganhasse duas horas livres, sem reuniões nem cobranças.',
      ],
      enunciado: 'O que provavelmente aconteceria?',
      rotuloBotao: 'CONTINUAR',
      opcoes: [
        { id: 'A', texto: 'Eu aproveitaria para descansar, porque estou sempre esgotado.', peso: { C: 2 } },
        { id: 'B', texto: 'Acabaria no celular, assistindo a alguma coisa ou me distraindo.', peso: { B: 2 } },
        { id: 'C', texto: 'Ficaria dividido entre tantas coisas que quero fazer.', peso: { A: 2 } },
        { id: 'D', texto: 'Conseguiria dedicar esse tempo ao que realmente quero.', peso: {} },
      ],
    },
    // TELA 06
    {
      id: 'q4',
      enunciado:
        'Quando você pensa em tudo o que gostaria de conquistar, como costuma escolher seus objetivos?',
      rotuloBotao: 'CONTINUAR',
      opcoes: [
        { id: 'A', texto: 'Tento fazer várias coisas ao mesmo tempo, porque todas parecem importantes.', peso: { A: 3 } },
        { id: 'B', texto: 'Escolho objetivos que fazem sentido, mas travo na hora de colocar em prática.', peso: { B: 3 } },
        { id: 'C', texto: 'Acabo perseguindo coisas que sinto que já deveria ter conquistado.', peso: { A: 3 } },
        { id: 'D', texto: 'Considero minha rotina e meu momento de vida antes de decidir.', peso: {} },
      ],
    },
    // TELA 07
    {
      id: 'q5',
      enunciado: 'Você já tentou organizar sua vida para parar de procrastinar?',
      apoio: 'Qual destas situações mais se parece com sua experiência?',
      rotuloBotao: 'CONTINUAR',
      opcoes: [
        { id: 'A', texto: 'Já fiz vários planejamentos, mas acabo abandonando todos.', peso: { B: 2 } },
        { id: 'B', texto: 'Já tentei aplicativos, agendas e métodos de produtividade, sem conseguir manter a rotina.', peso: { B: 2 } },
        { id: 'C', texto: 'Sempre começo motivado, mas os imprevistos atrapalham tudo.', peso: { B: 1, C: 1 } },
        { id: 'D', texto: 'Ainda não encontrei uma forma de organização que funcione para mim.', peso: { B: 1 } },
      ],
    },
    // TELA 08
    {
      id: 'q6',
      contexto: ['Estamos quase terminando.'],
      enunciado:
        'Se você pudesse resolver apenas uma coisa na sua rotina, o que faria mais diferença?',
      rotuloBotao: 'VER MEU RESULTADO',
      opcoes: [
        { id: 'A', texto: 'Saber exatamente quais objetivos devo priorizar agora.', peso: { A: 2 } },
        { id: 'B', texto: 'Conseguir transformar meus planos em ações concretas.', peso: { B: 2 } },
        { id: 'C', texto: 'Manter uma rotina mesmo quando surgirem imprevistos.', peso: { B: 2 } },
        { id: 'D', texto: 'Ter mais tempo e energia para minha vida fora do trabalho.', peso: { C: 2 } },
      ],
    },
  ],

  // TELA 05 — copy entre q3 e q4
  interstituicoes: [
    {
      depoisDaPergunta: 'q3',
      tela: {
        id: 'ponte',
        // *…* marca o destaque do titulo (ver TextoQuiz); so marcacao, a
        // redacao e a do doc v2. O ** nos paragrafos marca a expressao-pivo de
        // cada possibilidade — escaneabilidade dentro do card, sem mudar texto.
        titulo: 'Talvez o problema não seja *SÓ falta de tempo*, e sim não ter direcionamento e priorização.',
        paragrafos: [
          'Uma coisa é ter uma **rotina sobrecarregada de verdade**.',
          'Outra é ter algum tempo livre e **não saber como virar isso em progresso**.',
          'E tem uma terceira: estar perseguindo objetivos que **não cabem na vida que você tem hoje**.',
          'Qual dessas mais parece com a sua?',
        ],
        rotuloBotao: 'QUERO DESCOBRIR',
      },
    },
  ],

  // TELA 09
  processando: {
    titulo: 'Estamos organizando suas respostas...',
    linhas: [
      'Identificando suas principais dificuldades...',
      'Analisando como seus objetivos se relacionam com sua rotina...',
      'Preparando sua análise...',
    ],
    duracaoMs: 3200,
  },

  // TELA 10
  resultados: {
    A: {
      titulo: 'Você pode estar tentando viver várias fases da vida ao mesmo tempo.',
      paragrafos: [
        'Pelo que você respondeu, tem vários objetivos disputando a sua atenção de uma vez.',
        'Você quer cuidar da saúde, crescer no trabalho, tirar projetos do papel e ainda ter tempo pra viver.',
        'O problema é que nem sempre tudo isso cabe na mesma fase.',
        'E quando tudo parece igualmente importante, fica difícil decidir por onde começar.',
        '**O próximo passo talvez não seja arrumar espaço pra fazer tudo, e sim descobrir o que faz sentido pra vida que você vive hoje.**',
        'Preparei um vídeo curto mostrando como escolher objetivos mais coerentes com a sua realidade e começar a tirar do papel.',
      ],
      rotuloBotao: 'ASSISTIR À MINHA ANÁLISE',
    },
    B: {
      titulo: 'Você sabe o que quer. O difícil é fazer acontecer com consistência.',
      paragrafos: [
        'Pelo que você respondeu, você tem objetivos importantes, mas tem dificuldade de manter de pé ao longo do tempo.',
        'Você já tentou montar a rotina perfeita.',
        ['Comprou uma agenda.', 'Baixou aplicativo.', 'Fez listas.', 'Prometeu que dessa vez ia ser diferente.'],
        'Aí bastou uma semana complicada pra tudo sair do lugar.',
        '**Talvez você não precise de mais um plano que só funciona quando está tudo sob controle, e sim de uma forma de organização que leve em conta como a sua vida funciona de verdade.**',
        'Preparei um vídeo curto explicando por que tanto planejamento acaba abandonado e como montar uma estrutura mais viável pros seus objetivos.',
      ],
      rotuloBotao: 'ASSISTIR À MINHA ANÁLISE',
    },
    C: {
      titulo: 'Sua rotina pode estar ocupando o espaço que deveria ser seu.',
      paragrafos: [
        'Pelo que você respondeu, suas responsabilidades estão consumindo boa parte do seu tempo e da sua energia.',
        ['Você resolve problema.', 'Cumpre compromisso.', 'Atende o trabalho e as pessoas ao seu redor.'],
        'Mas quando chega a hora de fazer algo por você, já não sobra disposição.',
        '**Talvez a resposta não seja colocar mais tarefa na agenda, e sim rever prioridades, reconhecer limites e descobrir o que realmente cabe na sua rotina de hoje.**',
        'Preparei um vídeo curto mostrando como organizar objetivos de um jeito mais realista, sem depender de uma rotina perfeita.',
      ],
      rotuloBotao: 'ASSISTIR À MINHA ANÁLISE',
    },
    geral: {
      titulo: 'Seus objetivos e sua rotina merecem um olhar mais de perto.',
      paragrafos: [
        'Suas respostas não apontam pra uma só dificuldade.',
        'Isso costuma acontecer quando seus objetivos, seu tempo e sua forma de se organizar já funcionam em algumas áreas, mas ainda tem pontos que você quer melhorar.',
        'O próximo passo é entender como essas três coisas se conectam.',
        'Preparei um vídeo curto com uma forma de pensar seus objetivos e sua rotina de maneira integrada.',
      ],
      rotuloBotao: 'ASSISTIR À MINHA ANÁLISE',
    },
  },

  // Seção 4 dos docs. Limiares são hipóteses operacionais, recalibráveis por
  // quiz — por isso vivem aqui e não no motor.
  regras: {
    minimoParaAtribuir: 4,
    vantagemSemDesempate: 2,
    ordemDesempate: ['q4', 'q6'],
  },

  vsl: {
    provider: 'vturb',
    // Da aba Embed da VTurb (JavaScript, "Otimizar Velocidade" ligada). O
    // player e o arquivo de video tem ids diferentes: o segundo so aparece no
    // preload do .m3u8.
    videoId: '6af1c3e60b42ce3fc9fb7aa1',
    contaId: '9e6f61cc-e76a-4a7d-82d8-b1b1b195a704',
    arquivoVideoId: '6af1c3d2ffc8452284b83e02',
    chamada: 'Seu diagnóstico está *pronto*.',
    ctaAtSeconds: SEGUNDO_DA_OFERTA_NA_VSL,
    rotuloCta: 'ENTRAR AGORA PARA A TRILHA',
    // apoioCta foi absorvido pelo bloco de garantia abaixo — a mesma promessa
    // de 7 dias não deve aparecer duas vezes na mesma tela.
    garantia: {
      selo: '/quiz/selo-garantia-7-dias.png',
      eyebrow: 'GARANTIA INCONDICIONAL DE 7 DIAS',
      titulo: 'Teste a Trilha inteira *sem risco nenhum.*',
      texto: [
        'Entre, faça seu Mapa da Vida e comece a aplicar o método. Se em 7 dias você achar que não é pra você, me manda uma mensagem e eu devolvo cada centavo.',
        '**Sem formulário, sem pergunta, sem letra miúda.**',
      ],
    },
  },
}
