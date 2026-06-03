'use server'

import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { loginSchema, cadastroSchema, esqueciSenhaSchema, redefinirSenhaSchema } from '@/lib/validations'

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

  redirect(count && count > 0 ? '/objetivos' : '/content')
}

export async function cadastro(state: AuthState, formData: FormData): Promise<AuthState> {
  const result = cadastroSchema.safeParse({
    nome: formData.get('nome'),
    email: formData.get('email'),
    senha: formData.get('senha'),
    confirmarSenha: formData.get('confirmarSenha'),
  })

  if (!result.success) {
    return { errors: result.error.flatten().fieldErrors as Record<string, string[]> }
  }

  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase.auth.signUp({
    email: result.data.email,
    password: result.data.senha,
    options: {
      data: { nome: result.data.nome },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  })

  if (error) {
    console.error('[cadastro] Supabase error:', error.message, error.status)
    if (error.message.toLowerCase().includes('already registered') || error.message.toLowerCase().includes('user already exists')) {
      return { message: 'Este email já está cadastrado. Tente fazer login.' }
    }
    return { message: 'Não foi possível criar a conta. Tente novamente.' }
  }

  if (data.user && data.user.identities?.length === 0) {
    return { message: 'Este email já está cadastrado. Tente fazer login.' }
  }

  if (data.session) {
    redirect('/content')
  }

  redirect('/auth/verificar-email')
}

export async function logout() {
  const supabase = createServerSupabaseClient()
  await supabase.auth.signOut()
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

  redirect(count && count > 0 ? '/objetivos' : '/content')
}
