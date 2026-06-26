import { NextRequest, NextResponse } from 'next/server'
import { isCronAuthorized } from '@/lib/cron-auth'
import { createAdminSupabaseClient } from '@/lib/supabase-admin'
import { enviarEmail } from '@/lib/email'
import { templateLembreteMensal, templatePlanejamentoSemanal } from '@/lib/email-templates'

export const runtime = 'nodejs'
export const maxDuration = 60

// Verifica se o momento atual (em BRT = UTC-3) é domingo
function isHojeDomingo(): boolean {
  const agora = new Date()
  const brt = new Date(agora.getTime() - 3 * 60 * 60 * 1000)
  return brt.getUTCDay() === 0
}

async function enviarPlanejamentoSemanal(): Promise<{ enviados: number; erros: number }> {
  const supabase = createAdminSupabaseClient()
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!

  // Pagina todos os usuários autenticados
  const allUsers: Array<{ id: string; email: string }> = []
  let page = 1
  const perPage = 1000

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage })
    if (error) throw new Error(`Erro ao listar usuários: ${error.message}`)
    for (const u of data.users) {
      if (u.email) allUsers.push({ id: u.id, email: u.email })
    }
    if (data.users.length < perPage) break
    page++
  }

  // Busca nomes em batch
  const userIds = allUsers.map(u => u.id)
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, nome')
    .in('id', userIds)

  const nomeMap = new Map((profiles ?? []).map((p: { id: string; nome: string }) => [p.id, p.nome]))

  let enviados = 0
  let erros = 0

  for (const { id, email } of allUsers) {
    try {
      const nome = nomeMap.get(id) ?? 'amigo(a)'
      const { subject, html } = await templatePlanejamentoSemanal({
        nome,
        urlDashboard: `${siteUrl}/objetivos`,
      })
      await enviarEmail({ to: email, subject, html })
      enviados++
    } catch (err) {
      console.error(`[planejamento-semanal] Falha ao enviar para ${email}:`, err)
      erros++
    }
  }

  return { enviados, erros }
}

async function enviarLembreteMensal(): Promise<{ enviados: number; erros: number }> {
  const supabase = createAdminSupabaseClient()
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!

  // Busca todos os mapas ordenados do mais recente para o mais antigo
  const { data: mapaRows, error: mapaError } = await supabase
    .from('mapas')
    .select('user_id, criado_em')
    .order('criado_em', { ascending: false })

  if (mapaError) throw new Error(`Erro ao buscar mapas: ${mapaError.message}`)

  // Mantém apenas o mapa mais recente por usuário
  const latestByUser = new Map<string, string>()
  for (const row of mapaRows ?? []) {
    if (!latestByUser.has(row.user_id)) {
      latestByUser.set(row.user_id, row.criado_em)
    }
  }

  // Filtra quem está há 30+ dias sem fazer um novo mapa
  const candidatos: Array<{ userId: string; diasDesde: number }> = []
  for (const [userId, criado_em] of Array.from(latestByUser.entries())) {
    const dias = Math.floor((Date.now() - new Date(criado_em).getTime()) / (1000 * 60 * 60 * 24))
    if (dias >= 30) {
      candidatos.push({ userId, diasDesde: dias })
    }
  }

  let enviados = 0
  let erros = 0

  for (const { userId, diasDesde } of candidatos) {
    try {
      const [{ data: userData }, { data: profile }] = await Promise.all([
        supabase.auth.admin.getUserById(userId),
        supabase.from('profiles').select('nome').eq('id', userId).single(),
      ])

      const email = userData?.user?.email
      const nome = (profile as { nome: string } | null)?.nome ?? 'amigo(a)'

      if (!email) continue

      const { subject, html } = await templateLembreteMensal({
        nome,
        diasDesdeUltimoMapa: diasDesde,
        urlNovoMapa: `${siteUrl}/mapa/preparacao`,
      })

      await enviarEmail({ to: email, subject, html })
      enviados++
    } catch (err) {
      console.error(`[lembrete-mensal] Falha ao enviar para userId ${userId}:`, err)
      erros++
    }
  }

  return { enviados, erros }
}

export async function GET(req: NextRequest) {
  if (!isCronAuthorized(req)) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const resultado: {
    ok: boolean
    semanal?: { enviados: number; erros: number }
    mensal: { enviados: number; erros: number }
  } = { ok: true, mensal: { enviados: 0, erros: 0 } }

  // Planejamento semanal: somente aos domingos
  if (isHojeDomingo()) {
    try {
      resultado.semanal = await enviarPlanejamentoSemanal()
      console.error(`[planejamento-semanal] Enviados: ${resultado.semanal.enviados}, Erros: ${resultado.semanal.erros}`)
    } catch (err) {
      console.error('[planejamento-semanal] Erro geral:', err)
      resultado.semanal = { enviados: 0, erros: 1 }
    }
  }

  // Lembrete mensal: todo dia (a lógica interna filtra quem elegível)
  try {
    resultado.mensal = await enviarLembreteMensal()
    console.error(`[lembrete-mensal] Enviados: ${resultado.mensal.enviados}, Erros: ${resultado.mensal.erros}`)
  } catch (err) {
    console.error('[lembrete-mensal] Erro geral:', err)
    resultado.mensal = { enviados: 0, erros: 1 }
  }

  return NextResponse.json(resultado)
}
