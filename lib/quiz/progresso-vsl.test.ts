import { describe, expect, it } from 'vitest'
import { SALTO_MAXIMO_SEGUNDOS, avancarFronteira } from './progresso-vsl'

// Simula a sequencia de `video:timeupdate` que a VTurb emite (um por segundo).
function assistir(tempos: number[], fronteiraInicial = 0): number {
  return tempos.reduce(avancarFronteira, fronteiraInicial)
}
const deAte = (de: number, ate: number) => Array.from({ length: ate - de + 1 }, (_, i) => de + i)

describe('avancarFronteira', () => {
  it('reproducao continua empurra a fronteira segundo a segundo', () => {
    expect(assistir(deAte(0, 354))).toBe(354)
  })

  it('avanco manual nao conta: pular para depois da oferta nao libera nada', () => {
    // Assistiu 30s, apertou avancar ate 360 e deixou tocar ate o fim.
    expect(assistir([...deAte(0, 30), ...deAte(360, 600)])).toBe(30)
  })

  it('o salto do botao de avancar e maior que o limite tolerado', () => {
    expect(avancarFronteira(100, 100 + SALTO_MAXIMO_SEGUNDOS + 1)).toBe(100)
  })

  it('tique de 2s (turbo ou aba em segundo plano) ainda conta', () => {
    expect(assistir([0, 2, 4, 6])).toBe(6)
  })

  it('voltar no video nao reduz a fronteira, e passar por ela volta a empurrar', () => {
    expect(assistir([...deAte(0, 200), ...deAte(50, 250)])).toBe(250)
  })

  it('recarregar e continuar de onde parou segue contando', () => {
    // Fronteira gravada em 300; o "continuar assistindo" retoma no 300.
    expect(assistir(deAte(300, 354), 300)).toBe(354)
  })

  it('retomar um pouco antes da fronteira gravada tambem segue', () => {
    expect(assistir(deAte(297, 354), 300)).toBe(354)
  })

  it('tempo invalido e ignorado', () => {
    expect(avancarFronteira(10, Number.NaN)).toBe(10)
  })
})
