// Dados da empresa que vende a Trilha — exibidos nas páginas legais.
// O rodapé de public/trilha/index.html é HTML estático e repete o CNPJ à mão:
// ao mudar algo aqui, mude lá também.
export const EMPRESA = {
  razaoSocial: 'LSC Consultoria Ltda.',
  nomeFantasia: 'MindTrail',
  cnpj: '53.177.351/0001-39',
  endereco: 'Rua Santa Cruz, 2187, sala 10 — Vila Mariana, São Paulo/SP, CEP 04121-002',
  whatsapp: '(61) 98242-5139',
  whatsappUrl: 'https://wa.me/5561982425139',
  site: 'mindtrail.com.br',
} as const

export const LEGAL_ATUALIZADO_EM = '30 de outubro de 2026'

// Condições de venda citadas nos Termos. A página de venda (HTML estático) repete
// o preço à mão — e o valor cobrado de fato é o configurado no provider de
// pagamento. Os três precisam bater.
export const TRILHA_PRECO = 'R$ 297,00'
export const TRILHA_PARCELAS_MAX = 12
export const PROCESSADOR_PAGAMENTO = 'AbacatePay'
