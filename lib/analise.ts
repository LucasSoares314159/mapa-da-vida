import type { Area, NomePilar, StatusArea } from '@/types'

function maioriaStatus(statuses: StatusArea[]): StatusArea {
  const counts = { verde: 0, amarelo: 0, vermelho: 0 }
  for (const s of statuses) counts[s]++
  if (counts.vermelho >= 2) return 'vermelho'
  if (counts.amarelo >= 2) return 'amarelo'
  if (counts.verde >= 2) return 'verde'
  if (counts.vermelho === 1) return 'vermelho'
  if (counts.amarelo === 1) return 'amarelo'
  return 'verde'
}

export function calcularAnalise(areas: Area[]): string {
  const porPilar: Record<NomePilar, StatusArea[]> = { corpo: [], mente: [], espirito: [] }
  for (const area of areas) porPilar[area.pilar].push(area.status)

  const corpo = maioriaStatus(porPilar.corpo)
  const mente = maioriaStatus(porPilar.mente)
  const espirito = maioriaStatus(porPilar.espirito)

  if (corpo === 'vermelho' && mente === 'vermelho' && espirito === 'vermelho') {
    return 'Esse é o mapa de alguém no modo sobrevivência. Não é fraqueza — é o resultado de ignorar sinais por tempo demais. A boa notícia é que você parou para olhar. A maioria não para.'
  }
  if (espirito === 'verde' && corpo === 'vermelho' && mente === 'vermelho') {
    return 'Você sabe o que quer e tem clareza de propósito. O problema é que a estrutura ao redor — corpo, mente, rotina — não está colaborando. Clareza sem estrutura gera frustração.'
  }
  if (corpo === 'verde' && mente === 'vermelho' && espirito === 'vermelho') {
    return 'Seu corpo está em dia, mas a mente e o espírito estão pagando o preço de algo. Energia física sem direção tem um limite.'
  }
  if (corpo === 'vermelho') {
    return 'Seu corpo está sendo colocado em último lugar há um tempo. Isso não aparece de uma hora para outra — mas quando aparece, aparece de uma vez. Cansaço crônico, falta de energia, dificuldade de foco: tudo tem raiz aqui.'
  }
  if (mente === 'vermelho') {
    return 'A estrutura que deveria te sustentar está frágil. Trabalho pesando, relações superficiais, dinheiro sem controle — cada um desses sozinho é administrável. Os três juntos criam um ciclo que consome mais energia do que você percebe.'
  }
  if (espirito === 'vermelho') {
    return 'Você está funcionando. Mas não está vivendo. Sem propósito claro, sem experiências que renovam, sem nada que te reconecte — a rotina vira só sobrevivência. E sobrevivência cansa.'
  }
  if (corpo === 'amarelo' || mente === 'amarelo' || espirito === 'amarelo') {
    return 'Nada está em colapso. Mas nada está bem. Esse é o estado mais perigoso — porque não dói o suficiente para forçar uma mudança. Amarelo é o lugar onde as pessoas ficam presas por anos sem perceber.'
  }
  return 'Seu mapa está equilibrado. O próximo passo não é consertar — é construir consistência para que isso dure quando a vida apertar. Porque ela vai apertar.'
}
