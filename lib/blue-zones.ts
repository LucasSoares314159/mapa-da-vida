import type { NomeArea } from '@/types'

/**
 * Base científica por área (Camada 3 do diagnóstico).
 *
 * Cada área tem um fundamento (por que ela sustenta o resto da vida) e um
 * destaque com o achado de longevidade correspondente, sempre na moldura de
 * ganho: quanto a mais vivem as pessoas que cuidam dessa área, nunca quanto
 * se perde por negligenciá-la.
 *
 * O campo `fonte` distingue achados diretos do estudo Blue Zones de pesquisas
 * correlatas (saúde ocupacional, financeira, cognitiva). Essa distinção é
 * apenas interna, para curadoria editorial — não aparece para o usuário.
 */
export type FonteAchado = 'blue-zones' | 'correlato'

export interface BaseArea {
  /** Verdade estrutural da área: por que ela é fundamento para o resto. */
  fundamento: string
  /** O achado de longevidade contado como história: estudo, lugar, hábito. */
  destaque: string
  fonte: FonteAchado
}

export const BASE_AREAS: Record<NomeArea, BaseArea> = {
  'Exercícios Físicos': {
    fundamento:
      'Movimento é o que mantém o corpo capaz de fazer o que você precisa dele. Sem uso, força e fôlego encolhem, mesmo sem você notar no dia a dia.',
    destaque:
      'Nas Blue Zones ninguém treina em academia. Em Sardenha, pastores caminham 8 quilômetros por dia cuidando do rebanho. Esse movimento espalhado ao longo do dia soma até 4,5 anos de vida a mais.',
    fonte: 'blue-zones',
  },
  'Alimentação': {
    fundamento:
      'Comida é a base de tudo que o corpo faz. Energia, sono, humor e clareza mental saem do que você come todo dia, mesmo quando você não percebe.',
    destaque:
      'O Blue Zones, maior estudo de longevidade já feito, acompanhou populações no Japão, na Grécia, na Itália e na Costa Rica. Todas vivem em média 8 anos a mais. Comem devagar, preparam a própria comida e colocam vegetais e grãos no centro do prato.',
    fonte: 'blue-zones',
  },
  'Hobbies': {
    fundamento:
      'Fazer algo só por gostar descarrega a pressão que se acumula no resto da semana. Toda Blue Zone tem um ritual assim, protegido na rotina.',
    destaque:
      'Em Ikaria, na Grécia, a ilha inteira para pra sesta no meio da tarde. Quem tem esse hábito tem até 35% menos risco de morrer de doença do coração. Em Sardenha o ritual é o vinho no fim do dia, com os amigos.',
    fonte: 'blue-zones',
  },
  'Rede de Apoio': {
    fundamento:
      'Vínculo é fundamento de longevidade, no mesmo nível de comer bem e se movimentar. Ninguém envelhece bem sozinho.',
    destaque:
      'Isolamento social pesa quase como fumar 15 cigarros por dia. Ter poucos amigos próximos aumenta em 50% a chance de viver mais. Em Okinawa, uma das principais Blue Zones, esse grupo tem nome: moai, os amigos que caminham com você a vida inteira.',
    fonte: 'blue-zones',
  },
  'Trabalho': {
    fundamento:
      'Trabalho ocupa a maior parte das suas horas acordado. Quando ele pesa, o peso não fica no escritório: vai junto pro sono, pro fim de semana, pra mesa de jantar.',
    destaque:
      'Dez anos acompanhando trabalhadores industriais mostraram uma relação direta entre esgotamento constante e doença do coração. O corpo reage a prazo apertado como reage a ameaça, todo dia, por anos.',
    fonte: 'correlato',
  },
  'Finanças': {
    fundamento:
      'Dinheiro desorganizado cobra em preocupação constante. Saber onde você está importa mais que quanto você ganha, porque incerteza permanente desgasta o corpo como qualquer outro estresse crônico.',
    destaque:
      'Uma meta-análise encontrou 19% mais risco de infarto e AVC em quem vive sob estresse financeiro. Quanto mais preocupações financeiras acumuladas, menores as chances de ter saúde cardiovascular considerada boa.',
    fonte: 'correlato',
  },
  'Propósito': {
    fundamento:
      'Propósito é o que faz o esforço valer a pena. É a resposta pra pergunta de por que levantar amanhã, e ela precisa ser sua.',
    destaque:
      'Em Okinawa isso se chama ikigai. Quem consegue nomear o seu tem 72% menos risco de AVC e 38% menos risco de morrer por qualquer causa, segundo estudo com a população local.',
    fonte: 'blue-zones',
  },
  'Experiências': {
    fundamento:
      'Viver coisas novas é o que constrói reserva cognitiva. Numa rotina sempre igual, os anos passam sem deixar marca, e o cérebro perde estímulo pra continuar se adaptando.',
    destaque:
      'Um estudo acompanhou 6.700 adultos mais velhos: quem tinha feito ao menos uma viagem nos dois anos anteriores teve 31% menos risco de perda cognitiva e 59% menos risco de demência. Não precisa ser longe. Precisa ser novo.',
    fonte: 'correlato',
  },
  'Espiritualidade': {
    fundamento:
      'Prática espiritual é o que reconecta com algo maior que a lista de tarefas. Não precisa ser religião, precisa ser regular.',
    destaque:
      'Dos 263 centenários entrevistados pelo estudo Blue Zones, 258 pertenciam a alguma comunidade de fé. A denominação não importava. Frequentar encontros quatro vezes por mês está associado a viver de 4 a 14 anos a mais.',
    fonte: 'blue-zones',
  },
}

/**
 * Conexões entre pares de áreas críticas.
 *
 * É o que faz o diagnóstico soar analítico em vez de relatório: nomear como
 * uma área puxa a outra pra baixo. Cobre os pares mais comuns; quando o par
 * não existe aqui, o diagnóstico usa a leitura de conjunto sem cruzamento.
 *
 * A chave é montada com os nomes das duas áreas em ordem alfabética, para que
 * a busca independa da ordem em que as áreas foram selecionadas.
 */
export const CONEXOES: Record<string, string> = {
  'Alimentação|Trabalho':
    'Trabalho pesado consome o tempo que sobraria pra cozinhar, e comer no automático tira a energia que ajudaria a suportar o trabalho.',
  'Rede de Apoio|Trabalho':
    'Quando o trabalho ocupa tudo, os vínculos são os primeiros a serem adiados, e sem gente por perto não há quem perceba o desgaste antes de você.',
  'Alimentação|Exercícios Físicos':
    'Corpo parado e comida no automático andam juntos: falta energia pra treinar, e sem movimento o corpo pede pior comida.',
  'Exercícios Físicos|Trabalho':
    'Rotina de trabalho longa costuma comer o horário do corpo, e o corpo cobra isso de volta em disposição pro próprio trabalho.',
  'Finanças|Trabalho':
    'Dinheiro apertado prende você no trabalho que pesa, e trabalho que pesa tira a clareza pra organizar o dinheiro.',
  'Hobbies|Trabalho':
    'Sem tempo pra fazer algo por prazer, o trabalho vira a única coisa que preenche o dia, e a pressão não tem por onde sair.',
  'Propósito|Trabalho':
    'Trabalho sem propósito claro cansa diferente: o esforço é o mesmo, mas não sobra sensação de que valeu.',
  'Espiritualidade|Propósito':
    'Sem prática que reconecte com algo maior, fica mais difícil sustentar uma resposta sobre por que fazer o que se faz.',
  'Experiências|Hobbies':
    'Nada que se faça por prazer e nada de novo acontecendo: os dias começam a se parecer uns com os outros.',
  'Alimentação|Finanças':
    'Orçamento apertado empurra pra comida mais barata e mais rápida, e o corpo paga essa conta depois.',
  'Propósito|Rede de Apoio':
    'Sem pessoas por perto pra dividir a vida, fica mais difícil enxergar sentido no que se faz todo dia.',
}

/** Busca a conexão entre duas áreas, independente da ordem informada. */
export function conexaoEntre(a: NomeArea, b: NomeArea): string | null {
  const chave = [a, b].sort().join('|')
  return CONEXOES[chave] ?? null
}
