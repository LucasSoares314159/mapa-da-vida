import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  senha: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
})

export const cadastroSchema = z.object({
  nome: z.string().min(2, 'O nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
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
export type CadastroFormData = z.infer<typeof cadastroSchema>
export type EsqueciSenhaFormData = z.infer<typeof esqueciSenhaSchema>
export type RedefinirSenhaFormData = z.infer<typeof redefinirSenhaSchema>
export type AreaFormData = z.infer<typeof areaSchema>
export type MapaFormData = z.infer<typeof mapaSchema>

export const listaEsperaSchema = z.object({
  nome: z.string().min(2, 'O nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  whatsapp: z.string().min(14, 'Informe seu WhatsApp'),
  profissao: z.enum([
    'Tecnologia (Produto, Design, TI)',
    'Marketing (creator, analista, growth, social media)',
    'Executivos (founder, CMO, CPO, COO)',
    'Autônomos (empreendedor, artista, artesão)',
    'Saúde (medicina, fisioterapia, psicologia, enfermagem)',
    'Outro',
  ]).refine(Boolean, { message: 'Selecione sua profissão' }),
  utm_source: z.string().optional(),
  utm_medium: z.string().optional(),
  utm_campaign: z.string().optional(),
})

export type ListaEsperaFormData = z.infer<typeof listaEsperaSchema>
