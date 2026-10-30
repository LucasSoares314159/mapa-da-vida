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
export const quiz1: ConfigQuiz = {
  slug: 'quiz-1',
  versao: 1,
  tituloPagina: 'Descubra por que você continua adiando seus objetivos',
  descricaoPagina:
    'Responda a 6 perguntas rápidas e descubra o que pode estar fazendo você deixar seus objetivos pessoais sempre para depois.',

  // TELA 01
  abertura: {
    id: 'abertura',
    titulo: 'Descubra por que você continua adiando seus objetivos.',
    paragrafos: [
      'Responda a 6 perguntas rápidas e descubra o que pode estar fazendo você deixar seus objetivos pessoais sempre para depois.',
      '**Tempo estimado:** 2 minutos.',
    ],
    rotuloBotao: 'COMEÇAR MEU DIAGNÓSTICO',
  },

  perguntas: [
    // TELA 02
    {
      id: 'q1',
      enunciado: 'Você termina o dia cansado, mas com a sensação de que não fez nada por você?',
      apoio: 'Qual destas situações mais parece com sua rotina?',
      rotuloBotao: 'CONTINUAR',
      opcoes: [
        { id: 'A', texto: 'Passo o dia resolvendo coisas do trabalho.', peso: { C: 2 } },
        { id: 'B', texto: 'Tenho tantas responsabilidades que mal sobra tempo para mim.', peso: { C: 2 } },
        { id: 'C', texto: 'Minha rotina é imprevisível. Sempre aparece alguma coisa.', peso: { C: 1, B: 1 } },
        { id: 'D', texto: 'Até tenho momentos livres, mas não consigo aproveitá-los como gostaria.', peso: { B: 2 } },
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
        'Agora, uma pergunta importante.',
        'Imagine que, amanhã, você ganhasse duas horas livres, sem reuniões, compromissos ou cobranças.',
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
        { id: 'B', texto: 'Escolho objetivos que fazem sentido, mas tenho dificuldade para colocá-los em prática.', peso: { B: 3 } },
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
        titulo: 'Talvez exista uma diferença entre não ter tempo e não conseguir avançar.',
        paragrafos: [
          'Porque uma coisa é ter uma rotina realmente sobrecarregada.',
          'Outra é conseguir algum tempo livre, mas não saber como transformá-lo em progresso.',
          'E existe uma terceira possibilidade: estar tentando realizar objetivos que simplesmente não cabem na vida que você tem hoje.',
          'Vamos descobrir qual dessas situações mais se aproxima da sua.',
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
        'Suas respostas sugerem que você tem diferentes objetivos competindo pela sua atenção.',
        'Talvez você queira cuidar melhor da saúde, avançar profissionalmente, desenvolver projetos pessoais e ainda encontrar tempo para aproveitar a vida.',
        'O problema é que nem sempre todos esses objetivos cabem na mesma fase.',
        'E quando tudo parece igualmente importante, pode ficar difícil decidir por onde começar.',
        '**Talvez o próximo passo não seja encontrar espaço para fazer tudo.**',
        'Mas descobrir o que realmente faz sentido para a vida que você está vivendo agora.',
        'Preparamos um vídeo curto para mostrar como escolher objetivos mais coerentes com sua realidade e começar a transformá-los em ações concretas.',
      ],
      rotuloBotao: 'ASSISTIR À MINHA ANÁLISE',
    },
    B: {
      titulo: 'Você sabe o que quer. O difícil é fazer isso acontecer com consistência.',
      paragrafos: [
        'Suas respostas sugerem que você tem objetivos importantes, mas encontra dificuldades para transformá-los em ações que se mantenham ao longo do tempo.',
        'Talvez você já tenha tentado montar uma rotina perfeita.',
        ['Comprou uma agenda.', 'Baixou aplicativos.', 'Fez listas.', 'Prometeu que, dessa vez, seria diferente.'],
        'Mas bastou uma semana complicada para tudo começar a sair do lugar.',
        '**Talvez você não precise de mais um planejamento que funciona apenas quando tudo está sob controle.**',
        'Talvez precise de uma forma de organização que considere como sua vida realmente funciona.',
        'Preparamos um vídeo curto para explicar por que tantos planejamentos acabam sendo abandonados e como construir uma estrutura mais viável para seus objetivos.',
      ],
      rotuloBotao: 'ASSISTIR À MINHA ANÁLISE',
    },
    C: {
      titulo: 'Sua rotina pode estar ocupando o espaço que deveria ser seu.',
      paragrafos: [
        'Suas respostas sugerem que suas responsabilidades estão consumindo boa parte do seu tempo ou da sua energia.',
        ['Você resolve problemas.', 'Cumpre compromissos.', 'Atende às demandas do trabalho e das pessoas ao seu redor.'],
        'Mas, quando chega a hora de fazer algo por você, muitas vezes já não sobra disposição.',
        '**Talvez a resposta não seja adicionar ainda mais tarefas à sua agenda.**',
        'Pode ser necessário reconsiderar prioridades, reconhecer limites e descobrir o que realmente cabe na sua rotina atual.',
        'Preparamos um vídeo curto para mostrar como começar a organizar objetivos de maneira mais realista, sem depender de uma rotina perfeita.',
      ],
      rotuloBotao: 'ASSISTIR À MINHA ANÁLISE',
    },
    geral: {
      titulo: 'Seus objetivos e sua rotina merecem uma análise mais cuidadosa.',
      paragrafos: [
        'Suas respostas não apontam para uma única dificuldade predominante.',
        'Isso pode acontecer porque seus objetivos, sua disponibilidade e sua forma de organização já funcionam bem em algumas áreas, mas ainda existem pontos que você gostaria de melhorar.',
        'O próximo passo é compreender como essas dimensões se relacionam.',
        'Preparamos um vídeo curto para apresentar uma forma de pensar seus objetivos e sua rotina de maneira integrada.',
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
    // PENDÊNCIA: a VTurb ainda não foi configurada. Cole aqui o id do vídeo
    // (e contaId, se o embed exigir) — com videoId vazio a tela mostra o CTA
    // de imediato, sem player, em vez de um retângulo quebrado.
    videoId: '',
    contaId: '',
    chamada: 'Seu diagnóstico está pronto.',
    ctaAtSeconds: 0,
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
