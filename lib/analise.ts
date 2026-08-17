import type { Area, NomeArea, StatusArea } from '@/types'
import { BASE_AREAS, conexaoEntre, type BaseArea } from './blue-zones'

/**
 * Diagnóstico do Mapa da Vida.
 *
 * Substitui a análise antiga, que escolhia entre nove textos fixos a partir da
 * maioria de cor por pilar. Agora o texto é composto a partir das áreas
 * específicas que a pessoa marcou como críticas, em três camadas:
 *
 * 1. Seleção das áreas mais graves (vermelho antes de amarelo, sem limite por pilar)
 * 2. Projeção temporal: para onde esse padrão leva, e onde chegaram as
 *    populações que cuidaram dessas áreas
 * 3. Base científica por área, em lib/blue-zones.ts
 */

/** Quantas áreas críticas entram no texto. Mais que isso vira lista, não análise. */
const MAX_AREAS_DESTACADAS = 3

/**
 * Estimativa agregada do próprio estudo Blue Zones para o conjunto dos hábitos.
 *
 * Os achados por área não são somáveis: vêm de populações e metodologias
 * diferentes e seus efeitos se sobrepõem. Por isso a projeção usa este número
 * agregado em vez de somar os ganhos individuais.
 */
const GANHO_AGREGADO = 'de 8 a 10 anos de vida livre de doença'

export interface AreaDestacada {
  nome: NomeArea
  status: StatusArea
  base: BaseArea
}

export interface Diagnostico {
  /** Leitura de conjunto: o que o mapa mostra como um todo. */
  padrao: string
  /** Para onde esse padrão leva, e onde chegaram quem cuidou dessas áreas. */
  projecao: string[]
  /** Fecho que devolve agência, sem moral. */
  escolha: string
  /** Áreas críticas com seu fundamento e achado científico. */
  areasDestacadas: AreaDestacada[]
  totais: Record<StatusArea, number>
}

/** Ordena por gravidade: vermelho primeiro, depois amarelo. */
function ordenarPorGravidade(areas: Area[]): Area[] {
  const peso: Record<StatusArea, number> = { vermelho: 0, amarelo: 1, verde: 2 }
  return [...areas].sort((a, b) => peso[a.status] - peso[b.status])
}

/**
 * Escolhe as áreas que entram no diagnóstico: as mais graves, sem trava por
 * pilar. Se as três piores forem todas do mesmo pilar, o texto foca nesse
 * pilar — fidelidade ao que a pessoa reportou vale mais que equilíbrio
 * narrativo entre corpo, mente e espírito.
 */
function selecionarCriticas(areas: Area[]): Area[] {
  const criticas = areas.filter((a) => a.status !== 'verde')
  return ordenarPorGravidade(criticas).slice(0, MAX_AREAS_DESTACADAS)
}

/** Junta nomes em linguagem natural: "A", "A e B", "A, B e C". */
function listar(nomes: string[]): string {
  if (nomes.length <= 1) return nomes[0] ?? ''
  return `${nomes.slice(0, -1).join(', ')} e ${nomes[nomes.length - 1]}`
}

/** Números por extenso, para não deixar algarismo solto no meio do texto. */
const EXTENSO = ['nenhuma', 'uma', 'duas', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove']

function porExtenso(n: number): string {
  return EXTENSO[n] ?? String(n)
}

/**
 * Monta a leitura de conjunto. Quando há conexão conhecida entre as áreas
 * críticas, o texto nomeia como uma puxa a outra — é o que faz o diagnóstico
 * soar analítico em vez de virar lista de problemas.
 */
function montarPadrao(criticas: Area[], totais: Record<StatusArea, number>): string {
  if (criticas.length === 0) {
    return 'Nenhuma área do seu mapa está pedindo socorro. Isso é raro, e diz mais sobre consistência do que sobre sorte.'
  }

  // As conexões são escritas em tom de área crítica, então só entram quando as
  // duas áreas do par estão em vermelho. Em amarelo, o texto soaria mais grave
  // do que a pessoa reportou.
  const vermelhasDestacadas = criticas.filter((a) => a.status === 'vermelho')
  let conexao: string | null = null
  for (let i = 0; i < vermelhasDestacadas.length && !conexao; i++) {
    for (let j = i + 1; j < vermelhasDestacadas.length && !conexao; j++) {
      conexao = conexaoEntre(vermelhasDestacadas[i].area, vermelhasDestacadas[j].area)
    }
  }

  // Mapa inteiro no vermelho: nomear áreas uma a uma perde força diante do todo.
  if (totais.vermelho === 9) {
    return 'Todas as nove áreas do seu mapa estão no vermelho. Isso não é descuido, é o que acontece quando a vida inteira passa muito tempo em modo de sobrevivência, e uma área sem apoio derruba a seguinte.'
  }

  if (totais.vermelho >= 3) {
    const destaques = listar(vermelhasDestacadas.map((a) => a.area))
    const abertura =
      totais.vermelho > vermelhasDestacadas.length
        ? `${porExtenso(totais.vermelho)} das nove áreas do seu mapa estão no vermelho, e três delas pesam mais: ${destaques}.`
        : `${porExtenso(totais.vermelho)} das nove áreas do seu mapa estão no vermelho: ${destaques}.`
    const frase = abertura.charAt(0).toUpperCase() + abertura.slice(1)
    return conexao ? `${frase} E elas conversam entre si. ${conexao}` : frase
  }

  if (totais.vermelho > 0) {
    const nomesVermelhos = listar(vermelhasDestacadas.map((a) => a.area))
    const abertura =
      totais.vermelho === 1
        ? `Uma área do seu mapa está no vermelho: ${nomesVermelhos}.`
        : `Duas áreas do seu mapa estão no vermelho: ${nomesVermelhos}.`
    return conexao ? `${abertura} ${conexao}` : abertura
  }

  // Só amarelos: o estado mais fácil de ignorar.
  return `Seu mapa não tem emergência. Tem ${porExtenso(totais.amarelo)} ${
    totais.amarelo === 1 ? 'área' : 'áreas'
  } em amarelo, e isso diz algo específico: nada está quebrado o suficiente pra forçar uma decisão.`
}

/**
 * A projeção temporal: onde esse padrão chega se nada mudar, e onde chegaram
 * as populações que cuidaram dessas mesmas áreas. Sempre na moldura de ganho.
 */
function montarProjecao(criticas: Area[], totais: Record<StatusArea, number>): string[] {
  if (criticas.length === 0) {
    return [
      'Um mapa assim não se mantém sozinho. O que sustenta esse resultado é repetição, e repetição só continua enquanto for protegida.',
      `Nas Blue Zones, os hábitos que somam ${GANHO_AGREGADO} não são heroicos. São pequenos e repetidos por décadas. Você já está nesse caminho, e a única pergunta é o que acontece quando a vida apertar.`,
    ]
  }

  const soAmarelos = criticas.every((a) => a.status === 'amarelo')

  if (soAmarelos) {
    return [
      'O amarelo é confortável porque não dói. E por não doer, ele dura. Dez anos assim passam rápido, e o mapa continua igual, com a diferença de que o corpo tem dez anos a mais.',
      `Nas Blue Zones, os hábitos que geram ${GANHO_AGREGADO} não são heroicos. São pequenos e repetidos por décadas. A vantagem de sair do amarelo agora é que ainda não há dano pra reverter, só hábito pra construir.`,
    ]
  }

  // Mapa inteiro no vermelho pede outro tom: reconhecer o esgotamento sem
  // empilhar mais peso sobre quem já está carregando tudo.
  if (totais.vermelho === 9) {
    return [
      'Manter tudo de pé sozinho tem prazo. O corpo aguenta por um tempo, depois começa a cobrar em coisas que não dá pra adiar: sono que não descansa, doença que aparece, vontade que some.',
      `A saída aqui não é consertar nove áreas de uma vez, é escolher uma. Nas Blue Zones, as pessoas que somam ${GANHO_AGREGADO} não fizeram tudo certo ao mesmo tempo. Elas viveram em lugares onde um hábito bom puxava o próximo.`,
    ]
  }

  const muitasCriticas = totais.vermelho >= 3

  const primeiro = muitasCriticas
    ? 'Mantido do jeito que está, esse ciclo se aperta com o tempo. Cada área puxa a outra pra baixo, e o custo aparece devagar: cansaço que não passa com fim de semana, exames que começam a mudar, distância que vira solidão.'
    : 'Mantido do jeito que está, o custo aparece devagar. Não em crise, mas em desgaste: energia que não volta, disposição que encurta, o corpo pedindo mais tempo pra se recuperar do mesmo esforço de sempre.'

  const segundo = `As populações mais longevas do mundo não são as que trabalham menos. São as que protegem a mesa, o descanso e os vínculos como parte do trabalho de viver. O Blue Zones estima que esse conjunto de hábitos soma ${GANHO_AGREGADO}.`

  return [primeiro, segundo]
}

/** Fecho: constata que o mapa é de hoje, sem virar discurso motivacional. */
function montarEscolha(criticas: Area[], totais: Record<StatusArea, number>): string {
  if (criticas.length === 0) {
    return 'Esse mapa é de hoje. Mantê-lo assim é o trabalho, e ele começa agora.'
  }

  const soAmarelos = criticas.every((a) => a.status === 'amarelo')
  if (soAmarelos) {
    return 'Você tem a versão mais fácil desse problema: cedo o bastante pra que consertar seja só decidir.'
  }

  if (totais.vermelho === 9) {
    return 'Esse mapa é de hoje. Você parou pra olhar, e isso já é diferente de continuar sem olhar. Escolha uma área, a que parecer mais possível, e comece por ela.'
  }

  const destaque =
    totais.vermelho === 1
      ? 'A área em vermelho é também a que tem mais espaço pra mudança'
      : `As ${porExtenso(totais.vermelho)} áreas em vermelho são também as que têm mais espaço pra mudança`

  return `Esse mapa é de hoje. Ele mostra onde você está, não onde você vai ficar. ${destaque}.`
}

/** Monta o diagnóstico completo a partir das áreas respondidas. */
export function calcularDiagnostico(areas: Area[]): Diagnostico {
  const totais: Record<StatusArea, number> = { verde: 0, amarelo: 0, vermelho: 0 }
  for (const area of areas) totais[area.status]++

  const criticas = selecionarCriticas(areas)

  return {
    padrao: montarPadrao(criticas, totais),
    projecao: montarProjecao(criticas, totais),
    escolha: montarEscolha(criticas, totais),
    areasDestacadas: criticas.map((a) => ({
      nome: a.area,
      status: a.status,
      base: BASE_AREAS[a.area],
    })),
    totais,
  }
}

/**
 * Versão em texto corrido do diagnóstico, para contextos que precisam de uma
 * string única (prévia, e-mail, compartilhamento).
 */
export function calcularAnalise(areas: Area[]): string {
  const { padrao, projecao, escolha } = calcularDiagnostico(areas)
  return [padrao, ...projecao, escolha].join('\n\n')
}
