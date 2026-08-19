'use server'

import { randomUUID } from 'crypto'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { createAdminSupabaseClient } from '@/lib/supabase-admin'
import { salvarConteudoModulo, type Bloco } from '@/lib/conteudo-modulos'

// Mesma allowlist do middleware — server actions não passam por ele, então a
// checagem de admin precisa ser repetida aqui.
async function exigirAdmin() {
  const supabase = createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const admins = (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)

  if (!user?.email || !admins.includes(user.email.toLowerCase())) {
    throw new Error('Acesso negado.')
  }
}

export async function salvarConteudo(
  moduloId: string,
  blocos: Bloco[]
): Promise<{ error: string } | { success: true }> {
  try {
    await exigirAdmin()
  } catch {
    return { error: 'Acesso negado.' }
  }

  try {
    await salvarConteudoModulo(moduloId, blocos)
    return { success: true }
  } catch {
    return { error: 'Não foi possível salvar o conteúdo. Tente novamente.' }
  }
}

export async function uploadImagemModulo(
  formData: FormData
): Promise<{ error: string } | { url: string }> {
  try {
    await exigirAdmin()
  } catch {
    return { error: 'Acesso negado.' }
  }

  const arquivo = formData.get('arquivo')
  if (!(arquivo instanceof File)) {
    return { error: 'Nenhum arquivo enviado.' }
  }

  const extensao = arquivo.name.split('.').pop() ?? 'png'
  const caminho = `${randomUUID()}.${extensao}`

  const sb = createAdminSupabaseClient()
  const { error } = await sb.storage
    .from('modulos-imagens')
    .upload(caminho, arquivo, { contentType: arquivo.type })

  if (error) {
    return { error: 'Não foi possível enviar a imagem. Tente novamente.' }
  }

  const { data } = sb.storage.from('modulos-imagens').getPublicUrl(caminho)
  return { url: data.publicUrl }
}
