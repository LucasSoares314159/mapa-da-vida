import { describe, expect, it } from 'vitest'
import { montarMetadata } from './tipos'

// O metadata e o unico elo entre a venda e o anuncio que a gerou: se ele sair
// errado, a compra chega sem origem e o funil fica cego justamente no fim.

describe('montarMetadata', () => {
  it('sempre identifica produto e origem', () => {
    expect(montarMetadata({ source: 'lp-trilha' })).toEqual({
      produto: 'trilha-produtividade',
      source: 'lp-trilha',
    })
  })

  it('o produto e exatamente o que o webhook exige para processar a compra', () => {
    // O webhook descarta a cobranca se o produto divergir; um typo aqui
    // faria o pagamento acontecer sem liberar acesso.
    expect(montarMetadata({ source: 'quiz' }).produto).toBe('trilha-produtividade')
  })

  it('leva slug, perfil e cookies do Pixel quando vem do quiz', () => {
    const metadata = montarMetadata({
      source: 'quiz',
      quizSlug: 'quiz-1',
      resultProfile: 'B',
      fbp: 'fb.1.100.200',
      fbc: 'fb.1.100.abc',
    })

    expect(metadata.quiz_slug).toBe('quiz-1')
    expect(metadata.result_profile).toBe('B')
    expect(metadata.fbp).toBe('fb.1.100.200')
    expect(metadata.fbc).toBe('fb.1.100.abc')
  })

  it('achata as UTMs em chaves de primeiro nivel', () => {
    const metadata = montarMetadata({
      source: 'quiz',
      utm: { utm_source: 'meta', utm_campaign: 'frio-01' },
    })

    expect(metadata.utm_source).toBe('meta')
    expect(metadata.utm_campaign).toBe('frio-01')
  })

  it('omite campos vazios em vez de gravar string vazia', () => {
    const metadata = montarMetadata({
      source: 'quiz',
      utm: { utm_source: undefined, utm_medium: '' },
      fbp: undefined,
    })

    expect(metadata).not.toHaveProperty('utm_source')
    expect(metadata).not.toHaveProperty('utm_medium')
    expect(metadata).not.toHaveProperty('fbp')
  })

  it('trunca valor longo para manter o metadata portavel', () => {
    const metadata = montarMetadata({
      source: 'quiz',
      utm: { utm_campaign: 'x'.repeat(900) },
    })

    expect(metadata.utm_campaign).toHaveLength(500)
  })

  it('mantem um conjunto pequeno de chaves com todos os campos preenchidos', () => {
    const metadata = montarMetadata({
      source: 'quiz',
      quizSlug: 'quiz-1',
      resultProfile: 'geral',
      fbp: 'fb.1.1.1',
      fbc: 'fb.1.1.2',
      utm: {
        utm_source: 'meta',
        utm_medium: 'cpc',
        utm_campaign: 'c',
        utm_content: 'ct',
        utm_term: 't',
      },
    })

    expect(Object.keys(metadata).length).toBeLessThanOrEqual(50)
  })
})
