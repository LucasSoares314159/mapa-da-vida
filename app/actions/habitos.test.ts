import { beforeEach, describe, expect, it, vi } from 'vitest'
import { definirHabitoHoje } from './habitos'

// A marcação só aparece ao voltar para a tela se a action invalidar o Router Cache
// do Next. Estes testes travam isso: sucesso revalida, erro não.

const { revalidatePath } = vi.hoisted(() => ({ revalidatePath: vi.fn() }))
vi.mock('next/cache', () => ({ revalidatePath }))

type Resposta = { data?: unknown; error?: unknown }
let respostas: Record<string, Resposta>

// Query builder falso: todo filtro devolve o próprio builder, e o await (ou o
// maybeSingle) entrega a resposta configurada para a operação daquela tabela.
function builder(tabela: string) {
  let op = 'select'
  const b: Record<string, unknown> = {}
  const resolver = () => respostas[`${tabela}.${op}`] ?? { data: null, error: null }
  for (const m of ['select', 'eq', 'is']) b[m] = () => b
  b.delete = () => ((op = 'delete'), b)
  b.upsert = () => ((op = 'upsert'), b)
  b.maybeSingle = () => Promise.resolve(resolver())
  b.then = (ok: (r: Resposta) => unknown, falha: (e: unknown) => unknown) =>
    Promise.resolve(resolver()).then(ok, falha)
  return b
}

vi.mock('@/lib/supabase-server', () => ({
  createServerSupabaseClient: () => ({
    auth: { getUser: () => Promise.resolve({ data: { user: { id: 'u1' } } }) },
    from: (t: string) => builder(t),
  }),
}))

beforeEach(() => {
  revalidatePath.mockClear()
  respostas = { 'habitos.select': { data: { id: 'h1' }, error: null } }
})

describe('definirHabitoHoje', () => {
  it('marcar revalida Hábitos e a Trilha', async () => {
    const r = await definirHabitoHoje('h1', true)
    expect(r).toMatchObject({ data: { feito: true } })
    expect(revalidatePath).toHaveBeenCalledWith('/habitos', 'layout')
    expect(revalidatePath).toHaveBeenCalledWith('/content')
  })

  it('desmarcar também revalida', async () => {
    const r = await definirHabitoHoje('h1', false)
    expect(r).toMatchObject({ data: { feito: false } })
    expect(revalidatePath).toHaveBeenCalledWith('/habitos', 'layout')
  })

  it('falha ao gravar não revalida', async () => {
    respostas['habito_registros.upsert'] = { error: { message: 'x' } }
    const r = await definirHabitoHoje('h1', true)
    expect(r).toHaveProperty('error')
    expect(revalidatePath).not.toHaveBeenCalled()
  })

  it('hábito arquivado ou de outra pessoa não revalida', async () => {
    respostas['habitos.select'] = { data: null, error: null }
    const r = await definirHabitoHoje('h1', true)
    expect(r).toEqual({ error: 'Hábito não encontrado.' })
    expect(revalidatePath).not.toHaveBeenCalled()
  })
})
