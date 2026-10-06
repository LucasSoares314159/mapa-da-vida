'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { COOKIE_MAPA_OK, opcoesCookieMapaOk } from '@/lib/gate-mapa'
import { createAdminSupabaseClient } from '@/lib/supabase-admin'
import { buscarConviteCompra } from '@/lib/acesso-compra'
import { loginSchema, cadastroConviteSchema, esqueciSenhaSchema, redefinirSenhaSchema } from '@/lib/validations'

export type AuthState =
  | {
      errors?: Record<string, string[]>
      message?: string
    }
  | undefined

export async function login(state: AuthState, formData: FormData): Promise<AuthState> {
  const result = loginSchema.safeParse({
    email: formData.get('email'),
    senha: formData.get('senha'),
  })

  if (!result.success) {
    return { errors: result.error.flatten().fieldErrors as Record<string, string[]> }
  }

  const supabase = createServerSupabaseClient()
  const { error } = await supabase.auth.signInWithPassword({
    email: result.data.email,
    password: result.data.senha,
  })

  if (error) {
    return { message: 'Email ou senha incorretos.' }
  }

  const { data: { user } } = await supabase.auth.getUser()
  const { count } = await supabase
    .from('mapas')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user!.id)

  if (count && count > 0) {
    cookies().set(COOKIE_MAPA_OK, '1', opcoesCookieMapaOk())
    redirect('/objetivos')
  }

  // Sem mapa, o fluxo obrigatório vem antes de qualquer conteúdo.
  redirect('/mapa/novo')
}

export async function cadastroPorConvite(state: AuthState, formData: FormData): Promise<AuthState> {
  const result = cadastroConviteSchema.safeParse({
    nome: formData.get('nome'),
    telefone: formData.get('telefone'),
    token: formData.get('token'),
    senha: formData.get('senha'),
    confirmarSenha: formData.get('confirmarSenha'),
  })

  if (!result.success) {
    return { errors: result.error.flatten().fieldErrors as Record<string, string[]> }
  }

  let convite
  try {
    convite = await buscarConviteCompra(result.data.token)
  } catch (validationError) {
    console.error('[cadastro-compra] Falha ao validar convite:', validationError)
    return { message: 'Não foi possível validar o link. Tente novamente.' }
  }

  if (!convite) {
    return { message: 'Este link é inválido, expirou ou já foi utilizado.' }
  }

  const admin = createAdminSupabaseClient()
  const { data, error } = await admin.auth.admin.createUser({
    email: convite.email,
    password: result.data.senha,
    email_confirm: true,
    user_metadata: {
      nome: result.data.nome,
      telefone: result.data.telefone,
    },
  })

  if (error) {
    console.error('[cadastro-compra] Supabase error:', error.message, error.status)
    if (error.message.toLowerCase().includes('already registered') || error.message.toLowerCase().includes('user already exists')) {
      return { message: 'Este email já está cadastrado. Tente fazer login.' }
    }
    return { message: 'Não foi possível criar a conta. Tente novamente.' }
  }

  if (!data.user) {
    return { message: 'Não foi possível criar a conta. Tente novamente.' }
  }

  const now = new Date().toISOString()
  const { error: profileError } = await admin
    .from('profiles')
    .upsert({ id: data.user.id, nome: result.data.nome })

  if (profileError) {
    console.error('[cadastro-compra] Falha ao criar profile:', profileError)
    return { message: 'A conta foi criada, mas não foi possível liberar o acesso. Entre em contato com o suporte.' }
  }

  const { data: consumedToken, error: tokenError } = await admin
    .from('tokens_acesso_compra')
    .update({ used_at: now })
    .eq('id', convite.tokenId)
    .is('used_at', null)
    .is('invalidated_at', null)
    .select('id')
    .maybeSingle()

  if (tokenError || !consumedToken) {
    console.error('[cadastro-compra] Falha ao consumir token:', tokenError)
    return { message: 'A conta foi criada, mas o link não pôde ser finalizado. Entre em contato com o suporte.' }
  }

  const { error: purchaseError } = await admin
    .from('compras')
    .update({
      status: 'conta_criada',
      user_id: data.user.id,
      account_created_at: now,
      updated_at: now,
    })
    .eq('id', convite.compraId)

  if (purchaseError) {
    console.error('[cadastro-compra] Falha ao vincular usuario a compra:', purchaseError)
  }

  const supabase = createServerSupabaseClient()
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: convite.email,
    password: result.data.senha,
  })

  if (signInError) {
    redirect('/auth/login?cadastro=sucesso')
  }

  redirect('/content')
}

export async function logout() {
  const supabase = createServerSupabaseClient()
  await supabase.auth.signOut()
  // Sem isso, a próxima conta neste navegador herdaria o gate já aberto.
  cookies().delete(COOKIE_MAPA_OK)
  redirect('/auth/login')
}

export async function esqueciSenha(state: AuthState, formData: FormData): Promise<AuthState> {
  const result = esqueciSenhaSchema.safeParse({
    email: formData.get('email'),
  })

  if (!result.success) {
    return { errors: result.error.flatten().fieldErrors as Record<string, string[]> }
  }

  const supabase = createServerSupabaseClient()
  const { error } = await supabase.auth.resetPasswordForEmail(result.data.email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=/auth/redefinir-senha`,
  })

  if (error) {
    return { message: 'Não foi possível enviar o email. Tente novamente.' }
  }

  return { message: 'ok' }
}

export async function redefinirSenha(state: AuthState, formData: FormData): Promise<AuthState> {
  const result = redefinirSenhaSchema.safeParse({
    senha: formData.get('senha'),
    confirmarSenha: formData.get('confirmarSenha'),
  })

  if (!result.success) {
    return { errors: result.error.flatten().fieldErrors as Record<string, string[]> }
  }

  const supabase = createServerSupabaseClient()
  const { error } = await supabase.auth.updateUser({ password: result.data.senha })

  if (error) {
    return { message: 'Não foi possível redefinir a senha. O link pode ter expirado.' }
  }

  const { data: { user } } = await supabase.auth.getUser()
  const { count } = await supabase
    .from('mapas')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user!.id)

  if (count && count > 0) {
    cookies().set(COOKIE_MAPA_OK, '1', opcoesCookieMapaOk())
    redirect('/objetivos')
  }

  // Sem mapa, o fluxo obrigatório vem antes de qualquer conteúdo.
  redirect('/mapa/novo')
}
