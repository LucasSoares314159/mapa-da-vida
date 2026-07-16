import { NextRequest, NextResponse } from 'next/server'
import { isCronAuthorized } from '@/lib/cron-auth'
import { createAdminSupabaseClient } from '@/lib/supabase-admin'
import { enviarEmail } from '@/lib/email'
import {
  templateLembreteMensal,
  templatePlanejamentoSemanal,
  templateLembreteObjetivo,
  templateObjetivoConcluido,
} from '@/lib/email-templates'
import type { FrequenciaLembrete, PrazoObjetivo } from '@/types'

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

  // Envia só nos marcos do ciclo: 30 dias (1 mês) e depois a cada 7 dias, por 4 semanas (30, 37, 44, 51, 58)
  const MARCOS_DIAS = [30, 37, 44, 51, 58]
  const candidatos: Array<{ userId: string; diasDesde: number }> = []
  for (const [userId, criado_em] of Array.from(latestByUser.entries())) {
    const dias = Math.floor((Date.now() - new Date(criado_em).getTime()) / (1000 * 60 * 60 * 24))
    if (MARCOS_DIAS.includes(dias)) {
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

const INTERVALO_DIAS: Record<FrequenciaLembrete, number> = {
  semanal: 7,
  quinzenal: 15,
  mensal: 30,
}

const PRAZO_LABEL: Record<PrazoObjetivo, string> = {
  curto: 'curto prazo',
  medio: 'médio prazo',
  longo: 'longo prazo',
}

// Diferença em dias de calendário (não horas), comparando só a data (sem horário)
function diasEntre(de: Date, ate: Date): number {
  const msPorDia = 1000 * 60 * 60 * 24
  const deUTC = Date.UTC(de.getFullYear(), de.getMonth(), de.getDate())
  const ateUTC = Date.UTC(ate.getFullYear(), ate.getMonth(), ate.getDate())
  return Math.round((ateUTC - deUTC) / msPorDia)
}

function isMesmaData(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

async function enviarLembretesObjetivo(): Promise<{ enviados: number; erros: number }> {
  const supabase = createAdminSupabaseClient()
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!
  const agora = new Date()

  const { data: objetivos, error: objetivosError } = await supabase
    .from('objetivos')
    .select('id, user_id, texto, prazo, status, data_alvo, frequencia_lembrete, ultimo_lembrete_em, criado_em')
    .in('status', ['ativo', 'concluido'])
    .not('data_alvo', 'is', null)

  if (objetivosError) throw new Error(`Erro ao buscar objetivos: ${objetivosError.message}`)

  type ObjetivoRow = {
    id: string
    user_id: string
    texto: string
    prazo: PrazoObjetivo
    status: 'ativo' | 'concluido'
    data_alvo: string
    frequencia_lembrete: FrequenciaLembrete | null
    ultimo_lembrete_em: string | null
    criado_em: string
  }

  type Candidato = { objetivo: ObjetivoRow; tipo: 'lembrete' | 'conclusao' }
  const candidatos: Candidato[] = []

  for (const objetivo of (objetivos ?? []) as ObjetivoRow[]) {
    const dataAlvo = new Date(objetivo.data_alvo)

    if (objetivo.status === 'ativo') {
      if (!objetivo.frequencia_lembrete) continue
      // Prazo já vencido: para de cobrar até a pessoa concluir, arquivar ou editar a data
      if (diasEntre(agora, dataAlvo) < 0) continue
      const intervalo = INTERVALO_DIAS[objetivo.frequencia_lembrete]
      const desde = objetivo.ultimo_lembrete_em ? new Date(objetivo.ultimo_lembrete_em) : new Date(objetivo.criado_em)
      const diasDesdeUltimo = diasEntre(desde, agora)
      if (diasDesdeUltimo >= intervalo) {
        candidatos.push({ objetivo, tipo: 'lembrete' })
      }
    } else if (objetivo.status === 'concluido') {
      const jaEnviadoHoje = objetivo.ultimo_lembrete_em && isMesmaData(new Date(objetivo.ultimo_lembrete_em), agora)
      if (isMesmaData(dataAlvo, agora) && !jaEnviadoHoje) {
        candidatos.push({ objetivo, tipo: 'conclusao' })
      }
    }
  }

  let enviados = 0
  let erros = 0

  // Cache de nome/email por usuário para não repetir buscas quando o mesmo usuário tem vários objetivos elegíveis
  const usuarioCache = new Map<string, { email: string | null; nome: string }>()

  for (const { objetivo, tipo } of candidatos) {
    try {
      if (!usuarioCache.has(objetivo.user_id)) {
        const [{ data: userData }, { data: profile }] = await Promise.all([
          supabase.auth.admin.getUserById(objetivo.user_id),
          supabase.from('profiles').select('nome').eq('id', objetivo.user_id).single(),
        ])
        usuarioCache.set(objetivo.user_id, {
          email: userData?.user?.email ?? null,
          nome: (profile as { nome: string } | null)?.nome ?? 'amigo(a)',
        })
      }

      const { email, nome } = usuarioCache.get(objetivo.user_id)!
      if (!email) continue

      if (tipo === 'lembrete') {
        const diasRestantes = diasEntre(agora, new Date(objetivo.data_alvo))
        const { subject, html } = await templateLembreteObjetivo({
          nome,
          textoObjetivo: objetivo.texto,
          prazoLabel: PRAZO_LABEL[objetivo.prazo],
          diasRestantes,
          urlObjetivos: `${siteUrl}/objetivos`,
        })
        await enviarEmail({ to: email, subject, html })
      } else {
        const { subject, html } = await templateObjetivoConcluido({
          nome,
          textoObjetivo: objetivo.texto,
          urlObjetivos: `${siteUrl}/objetivos`,
        })
        await enviarEmail({ to: email, subject, html })
      }

      await supabase
        .from('objetivos')
        .update({ ultimo_lembrete_em: agora.toISOString() })
        .eq('id', objetivo.id)

      enviados++
    } catch (err) {
      console.error(`[lembrete-objetivo] Falha ao enviar para objetivo ${objetivo.id}:`, err)
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
    objetivos: { enviados: number; erros: number }
  } = { ok: true, mensal: { enviados: 0, erros: 0 }, objetivos: { enviados: 0, erros: 0 } }

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

  // Lembretes de objetivo: todo dia (a lógica interna filtra quem elegível)
  try {
    resultado.objetivos = await enviarLembretesObjetivo()
    console.error(`[lembrete-objetivo] Enviados: ${resultado.objetivos.enviados}, Erros: ${resultado.objetivos.erros}`)
  } catch (err) {
    console.error('[lembrete-objetivo] Erro geral:', err)
    resultado.objetivos = { enviados: 0, erros: 1 }
  }

  return NextResponse.json(resultado)
}
