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

  redirect('/dashboard')
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
  const { error } = await supabase.auth.signUp({
    email: result.data.email,
    password: result.data.senha,
    options: {
      data: { nome: result.data.nome },
    },
  })

  if (error) {
    return { message: error.message }
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
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?type=recovery`,
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

  redirect('/dashboard')
}
