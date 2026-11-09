'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alerta } from '@/components/ui/alerta'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { arquivarHabito, criarHabito, editarHabito } from '@/app/actions/habitos'
import { habitoSchema } from '@/lib/validations'
import { cn } from '@/lib/utils'
import { ICONES_HABITO, PILARES, type IconeHabito, type NomeArea, type StatusArea } from '@/types'
import { CirculoHabito } from './CirculoHabito'
import { ICONE_HABITO } from './iconesHabito'

type HabitoEditavel = {
  id: string
  nome: string
  icone: IconeHabito
  area: NomeArea
  meta_semanal: number
  ancora: string | null
}

type Props = {
  /** Ausente: criação. Presente: edição, com a opção de arquivar. */
  habito?: HabitoEditavel
  /** Cor de cada área no último Mapa da pessoa. Área sem status fica sem bolinha. */
  statusPorArea: Partial<Record<NomeArea, StatusArea>>
}

type Campo = 'nome' | 'icone' | 'area' | 'meta_semanal' | 'ancora'

const MAX_NOME = 24
const ICONES = Object.keys(ICONES_HABITO) as IconeHabito[]
const METAS = [1, 2, 3, 4, 5, 6, 7]

const COR_PONTO: Record<StatusArea, string> = {
  verde: 'bg-mt-green',
  amarelo: 'bg-mt-yellow',
  vermelho: 'bg-mt-red',
}

// Setas movem a escolha dentro do radiogroup, como num grupo de rádios nativo.
function navegarRadio(e: React.KeyboardEvent<HTMLButtonElement>, escolher: (indice: number) => void) {
  const passo = ({ ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 } as Record<string, number>)[e.key]
  if (!passo) return
  e.preventDefault()
  const grupo = e.currentTarget.closest('[role="radiogroup"]')
  if (!grupo) return
  const itens = Array.from(grupo.querySelectorAll<HTMLButtonElement>('[role="radio"]'))
  const proximo = (itens.indexOf(e.currentTarget) + passo + itens.length) % itens.length
  itens[proximo]?.focus()
  escolher(proximo)
}

function textoMeta(meta: number) {
  return meta === 7 ? 'Todo dia.' : `${meta}x por semana, em qualquer dia. Dia livre não é falha.`
}

export function FormularioHabito({ habito, statusPorArea }: Props) {
  const router = useRouter()
  const editando = !!habito

  const [nome, setNome] = useState(habito?.nome ?? '')
  const [icone, setIcone] = useState<IconeHabito | null>(habito?.icone ?? null)
  const [area, setArea] = useState<NomeArea | null>(habito?.area ?? null)
  const [meta, setMeta] = useState(habito?.meta_semanal ?? 3)
  const [ancora, setAncora] = useState(habito?.ancora ?? '')

  const [erros, setErros] = useState<Partial<Record<Campo, string>>>({})
  const [erroServidor, setErroServidor] = useState('')
  const [confirmarArquivo, setConfirmarArquivo] = useState(false)
  const [salvando, startSalvar] = useTransition()
  const [arquivando, startArquivar] = useTransition()

  const areas = Object.values(PILARES).flatMap((p) => p.areas)

  function limparErro(campo: Campo) {
    setErros((e) => ({ ...e, [campo]: undefined }))
  }

  function salvar(e: React.FormEvent) {
    e.preventDefault()
    setErroServidor('')
    const entrada = { nome, icone: icone ?? '', area: area ?? '', meta_semanal: meta, ancora }
    const r = habitoSchema.safeParse(entrada)
    if (!r.success) {
      const porCampo: Partial<Record<Campo, string>> = {}
      for (const issue of r.error.issues) {
        const campo = issue.path[0] as Campo
        porCampo[campo] ??= issue.message
      }
      setErros(porCampo)
      return
    }
    // O servidor valida de novo: a action é um endpoint público.
    const dados = { ...r.data, ancora: r.data.ancora ?? undefined }
    startSalvar(async () => {
      const resultado = editando ? await editarHabito(habito.id, dados) : await criarHabito(dados)
      if ('redirectTo' in resultado) return router.push(resultado.redirectTo)
      if ('error' in resultado) return setErroServidor(resultado.error)
      router.push('/habitos')
      router.refresh()
    })
  }

  function arquivar() {
    if (!habito) return
    startArquivar(async () => {
      const resultado = await arquivarHabito(habito.id)
      if ('redirectTo' in resultado) return router.push(resultado.redirectTo)
      if ('error' in resultado) {
        setConfirmarArquivo(false)
        return setErroServidor(resultado.error)
      }
      router.push('/habitos')
      router.refresh()
    })
  }

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col px-5 pb-16 pt-8 sm:px-8">
      <h1 className="mb-titulo font-heading text-titulo font-medium text-mt-green-dark">
        {editando ? 'Editar hábito' : 'Novo hábito'}
      </h1>

      <div className="mb-10 flex justify-center">
        <CirculoHabito
          estatico
          nome={nome.trim() || 'Seu hábito'}
          icone={icone ?? 'cuidado'}
          meta={meta}
          feitosSemana={0}
          feito={false}
          celebrando={null}
          onAlternar={() => {}}
        />
      </div>

      <form onSubmit={salvar} noValidate className="flex flex-col gap-9">
        {!editando && (
          <p className="apoio -mt-4">comece com poucos. três hábitos que você cumpre valem mais que dez que você evita.</p>
        )}

        {/* Nome */}
        <div className="flex flex-col gap-2">
          <div className="flex items-baseline justify-between">
            <label htmlFor="habito-nome" className="text-base font-semibold text-mt-green-dark">
              O que você vai fazer?
            </label>
            <span className="text-sm text-mt-apoio" aria-hidden>
              {nome.length}/{MAX_NOME}
            </span>
          </div>
          <Input
            id="habito-nome"
            value={nome}
            maxLength={MAX_NOME}
            placeholder="Ex.: caminhar 20 min"
            aria-invalid={!!erros.nome}
            aria-describedby="habito-nome-ajuda"
            onChange={(e) => {
              setNome(e.target.value)
              limparErro('nome')
            }}
          />
          <span id="habito-nome-ajuda" className={cn('text-sm', erros.nome ? 'text-mt-red' : 'text-mt-apoio')}>
            {erros.nome ?? 'Curto e pequeno o bastante para caber num dia ruim.'}
          </span>
        </div>

        {/* Ícone */}
        <div className="flex flex-col gap-3">
          <span id="habito-icone-rotulo" className="text-base font-semibold text-mt-green-dark">
            Ícone
          </span>
          <div role="radiogroup" aria-labelledby="habito-icone-rotulo" className="grid grid-cols-5 gap-2">
            {ICONES.map((id, i) => {
              const Icone = ICONE_HABITO[id]
              const marcado = icone === id
              return (
                <button
                  key={id}
                  type="button"
                  role="radio"
                  aria-checked={marcado}
                  aria-label={ICONES_HABITO[id].label}
                  tabIndex={marcado || (!icone && i === 0) ? 0 : -1}
                  onClick={() => {
                    setIcone(id)
                    limparErro('icone')
                  }}
                  onKeyDown={(e) => navegarRadio(e, (j) => setIcone(ICONES[j]))}
                  className={cn(
                    'flex h-14 items-center justify-center rounded-elemento transition-colors focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-mt-green-dark',
                    marcado
                      ? 'border-2 border-mt-green-dark bg-mt-green'
                      : 'border-linha border-mt-border bg-white hover:bg-mt-green-sup'
                  )}
                >
                  <Icone className="size-6 text-mt-green-dark" strokeWidth={1.8} aria-hidden />
                </button>
              )
            })}
          </div>
          {erros.icone && <span className="text-sm text-mt-red">{erros.icone}</span>}
        </div>

        {/* Área do Mapa */}
        <div className="flex flex-col gap-3">
          <span id="habito-area-rotulo" className="text-base font-semibold text-mt-green-dark">
            Que área do seu Mapa ele cuida?
          </span>
          <div role="radiogroup" aria-labelledby="habito-area-rotulo" className="flex flex-col gap-4">
            {Object.values(PILARES).map((pilar) => (
              <div key={pilar.label} role="group" aria-label={pilar.label} className="flex flex-col gap-2">
                <span className="text-sm font-medium text-mt-apoio">{pilar.label}</span>
                <div className="flex flex-wrap gap-2">
                  {pilar.areas.map((a) => {
                    const marcada = area === a
                    const status = statusPorArea[a]
                    return (
                      <button
                        key={a}
                        type="button"
                        role="radio"
                        aria-checked={marcada}
                        aria-label={status ? `${a}, ${status} no último Mapa` : a}
                        tabIndex={marcada || (!area && a === areas[0]) ? 0 : -1}
                        onClick={() => {
                          setArea(a)
                          limparErro('area')
                        }}
                        onKeyDown={(e) => navegarRadio(e, (j) => setArea(areas[j]))}
                        className={cn(
                          'flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-mt-green-dark',
                          marcada
                            ? 'bg-mt-green-dark text-mt-off-white'
                            : 'border-linha border-mt-border bg-white text-mt-black hover:bg-mt-green-sup'
                        )}
                      >
                        {status && (
                          <span
                            aria-hidden
                            className={cn('size-2.5 shrink-0 rounded-full', COR_PONTO[status], marcada && 'ring-2 ring-mt-off-white')}
                          />
                        )}
                        {a}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
          {erros.area && <span className="text-sm text-mt-red">{erros.area}</span>}
        </div>

        {/* Meta semanal */}
        <div className="flex flex-col gap-3">
          <span id="habito-meta-rotulo" className="text-base font-semibold text-mt-green-dark">
            Quantas vezes por semana?
          </span>
          <div role="radiogroup" aria-labelledby="habito-meta-rotulo" className="grid grid-cols-7 gap-2">
            {METAS.map((n) => {
              const marcada = meta === n
              return (
                <button
                  key={n}
                  type="button"
                  role="radio"
                  aria-checked={marcada}
                  aria-label={n === 7 ? 'Todo dia' : `${n} vezes por semana`}
                  tabIndex={marcada ? 0 : -1}
                  onClick={() => setMeta(n)}
                  onKeyDown={(e) => navegarRadio(e, (j) => setMeta(METAS[j]))}
                  className={cn(
                    'flex h-11 items-center justify-center rounded-elemento text-base font-medium transition-colors focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-mt-green-dark',
                    marcada
                      ? 'bg-mt-green-dark text-mt-off-white'
                      : 'border-linha border-mt-border bg-white text-mt-black hover:bg-mt-green-sup'
                  )}
                >
                  {n}
                </button>
              )
            })}
          </div>
          <span className="text-sm text-mt-apoio">{textoMeta(meta)}</span>
        </div>

        {/* Âncora */}
        <div className="flex flex-col gap-2">
          <label htmlFor="habito-ancora" className="text-base font-semibold text-mt-green-dark">
            Quando? <span className="font-normal text-mt-apoio">(opcional)</span>
          </label>
          <div className="flex min-h-11 items-center rounded-elemento border border-mt-border bg-white pl-4 focus-within:border-mt-green focus-within:ring-[3px] focus-within:ring-mt-green/25">
            <span className="whitespace-nowrap text-base text-mt-apoio">Depois de</span>
            <input
              id="habito-ancora"
              value={ancora}
              maxLength={60}
              placeholder="almoçar"
              aria-describedby="habito-ancora-ajuda"
              onChange={(e) => setAncora(e.target.value)}
              className="min-w-0 flex-1 bg-transparent px-2 py-2.5 text-base text-mt-black outline-none placeholder:text-mt-apoio/70"
            />
          </div>
          <span id="habito-ancora-ajuda" className={cn('text-sm', erros.ancora ? 'text-mt-red' : 'text-mt-apoio')}>
            {erros.ancora ?? 'Amarrar o hábito a algo que você já faz ajuda a lembrar dele.'}
          </span>
        </div>

        {erroServidor && (
          <Alerta variante="atencao" titulo="Não deu certo">
            {erroServidor}
          </Alerta>
        )}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button asChild variant="outline">
            <Link href="/habitos">Cancelar</Link>
          </Button>
          <Button type="submit" disabled={salvando}>
            {salvando ? 'Salvando…' : editando ? 'Salvar' : 'Criar hábito'}
          </Button>
        </div>
      </form>

      {editando && (
        <div className="mt-12 flex flex-col items-start gap-3 border-t-linha border-mt-border pt-8">
          <h2 className="text-titulo-card font-bold text-mt-green-dark">Arquivar hábito</h2>
          <p className="text-sm text-mt-apoio">
            Ele sai da sua tela de hoje. O que você já fez continua contando no seu progresso.
          </p>
          <Button type="button" variant="outline" onClick={() => setConfirmarArquivo(true)}>
            Arquivar
          </Button>
        </div>
      )}

      <Dialog open={confirmarArquivo} onOpenChange={setConfirmarArquivo}>
        <DialogContent>
          <div className="flex flex-col gap-5 p-card-lg">
            <DialogHeader className="pr-8">
              {/* O nome é texto da pessoa: não pode virar minúsculo com o título. */}
              <DialogTitle className="text-subtitulo text-mt-green-dark">
                Arquivar “<span className="normal-case">{habito?.nome}</span>”?
              </DialogTitle>
              <DialogDescription className="text-base text-mt-apoio">
                O hábito sai da sua tela de hoje. O histórico continua contando no seu progresso.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" onClick={() => setConfirmarArquivo(false)}>
                Manter
              </Button>
              <Button type="button" variant="destructive" disabled={arquivando} onClick={arquivar}>
                {arquivando ? 'Arquivando…' : 'Arquivar'}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
