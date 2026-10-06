import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  senha: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
})

export const cadastroConviteSchema = z.object({
  nome: z.string().min(2, 'O nome deve ter pelo menos 2 caracteres'),
  telefone: z.string().min(10, 'Informe um telefone válido').max(20, 'Telefone inválido'),
  token: z.string().min(32, 'Link de acesso inválido'),
  senha: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
  confirmarSenha: z.string(),
}).refine((data) => data.senha === data.confirmarSenha, {
  message: 'As senhas não coincidem',
  path: ['confirmarSenha'],
})

export const esqueciSenhaSchema = z.object({
  email: z.string().email('Email inválido'),
})

export const redefinirSenhaSchema = z.object({
  senha: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
  confirmarSenha: z.string(),
}).refine((data) => data.senha === data.confirmarSenha, {
  message: 'As senhas não coincidem',
  path: ['confirmarSenha'],
})

export const areaSchema = z.object({
  status: z.enum(['verde', 'amarelo', 'vermelho']),
  observacao: z.string().optional(),
})

export const mapaSchema = z.object({
  titulo: z.string().optional(),
  areas: z.array(areaSchema).length(9, 'Todas as 9 áreas devem ser preenchidas'),
})

export type LoginFormData = z.infer<typeof loginSchema>
export type CadastroConviteFormData = z.infer<typeof cadastroConviteSchema>
export type EsqueciSenhaFormData = z.infer<typeof esqueciSenhaSchema>
export type RedefinirSenhaFormData = z.infer<typeof redefinirSenhaSchema>
export type AreaFormData = z.infer<typeof areaSchema>
export type MapaFormData = z.infer<typeof mapaSchema>

// Grupos de profissão da lista de espera. Mantidos separados dos grupos do
// onboarding (PROFISSOES_ONBOARDING) porque alterar estes rótulos mudaria o
// histórico já captado pelo webhook da lista.
export const PROFISSOES_LISTA_ESPERA = [
  'Tecnologia (Produto, Design, TI)',
  'Marketing (creator, analista, growth, social media)',
  'Executivos (founder, CMO, CPO, COO)',
  'Autônomos (empreendedor, artista, artesão)',
  'Saúde (medicina, fisioterapia, psicologia, enfermagem)',
  'Outro',
] as const

export const listaEsperaSchema = z.object({
  nome: z.string().min(2, 'O nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  whatsapp: z.string().min(14, 'Informe seu WhatsApp'),
  profissao: z.enum(PROFISSOES_LISTA_ESPERA).refine(Boolean, { message: 'Selecione sua profissão' }),
  utm_source: z.string().optional(),
  utm_medium: z.string().optional(),
  utm_campaign: z.string().optional(),
})

export type ListaEsperaFormData = z.infer<typeof listaEsperaSchema>

// --- Mapa da Vida conversacional ---
// A observação virou obrigatória: o fluxo de uma pergunta por tela existe para
// a pessoa justificar cada escolha. O mínimo é baixo de propósito — uma frase
// basta, e exigir parágrafo aumentaria o abandono no meio do onboarding.
export const MIN_OBSERVACAO = 40

export const areaConversaSchema = z.object({
  area: z.string(),
  pilar: z.enum(['corpo', 'mente', 'espirito']),
  status: z.enum(['verde', 'amarelo', 'vermelho']),
  observacao: z
    .string()
    .trim()
    .min(MIN_OBSERVACAO, 'Escreva uma frase com o motivo da sua escolha.'),
})

export const mapaConversaSchema = z.object({
  titulo: z.string().optional(),
  areas: z.array(areaConversaSchema).length(9, 'Todas as 9 áreas devem ser preenchidas'),
})

// Grupos de ICP do onboarding — orientam o follow-up de mentoria.
export const PROFISSOES_ONBOARDING = [
  'Marketing (creator, analista, growth, social media)',
  'Executivos (founder, CEO, CMO, CPO, COO)',
  'Produto, Design e Tecnologia (PM, PO, designer, dev, dados)',
  'Saúde (medicina, psicologia, nutrição, fisioterapia, enfermagem)',
  'Educação e Consultoria (professor, mentor, consultor)',
  'Autônomos (empreendedor, artista, artesão)',
  'Outro',
] as const

const HOJE_ISO = () => new Date().toISOString().slice(0, 10)

export const perfilOnboardingSchema = z
  .object({
    data_nascimento: z.iso.date('Informe a data no formato dia/mês/ano'),
    profissao: z.enum(PROFISSOES_ONBOARDING, { message: 'Selecione uma opção' }),
    profissao_outro: z.string().trim().max(80, 'Use até 80 caracteres').optional(),
  })
  .refine((d) => d.data_nascimento <= HOJE_ISO(), {
    message: 'A data de nascimento não pode estar no futuro',
    path: ['data_nascimento'],
  })
  .refine(
    (d) => {
      // Faixa ampla de propósito: serve para barrar erro de digitação de ano,
      // não para julgar quem pode usar a plataforma.
      const ano = Number(d.data_nascimento.slice(0, 4))
      return ano >= 1915 && ano <= new Date().getFullYear() - 13
    },
    { message: 'Confira o ano de nascimento', path: ['data_nascimento'] }
  )
  .refine((d) => d.profissao !== 'Outro' || !!d.profissao_outro, {
    message: 'Conte qual é a sua profissão',
    path: ['profissao_outro'],
  })

export type AreaConversaData = z.infer<typeof areaConversaSchema>
export type PerfilOnboardingData = z.infer<typeof perfilOnboardingSchema>
