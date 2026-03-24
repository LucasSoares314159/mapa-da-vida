'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Eye, FileText, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Mapa } from '@/types'

const MAPAS_POR_PAGINA = 5

type Tab = 'todos' | 'com-vermelho' | 'equilibrados'
type Periodo = '7' | '30' | '90' | '180' | '365' | 'todos'

const PERIODOS: { value: Periodo; label: string }[] = [
  { value: '7', label: '7 dias' },
  { value: '30', label: '30 dias' },
  { value: '90', label: '90 dias' },
  { value: '180', label: '180 dias' },
  { value: '365', label: '1 ano' },
  { value: 'todos', label: 'Todos os tempos' },
]

type Props = {
  mapas: Mapa[]
}

function StatusPill({ count, tipo }: { count: number; tipo: 'verde' | 'amarelo' | 'vermelho' }) {
  const estilos = {
    verde:    { bg: 'rgba(87,170,143,0.15)',  cor: '#57AA8F', ponto: '#57AA8F' },
    amarelo:  { bg: 'rgba(212,168,67,0.15)',  cor: '#D4A843', ponto: '#D4A843' },
    vermelho: { bg: 'rgba(192,80,80,0.15)',   cor: '#C05050', ponto: '#C05050' },
  }
  const e = estilos[tipo]
  return (
    <span
      className="flex items-center gap-1.5 text-sm font-medium"
      style={{
        backgroundColor: e.bg,
        color: e.cor,
        borderRadius: '20px',
        padding: '4px 10px',
      }}
    >
      <span
        style={{
          width: 7,
          height: 7,
          borderRadius: '50%',
          backgroundColor: e.ponto,
          flexShrink: 0,
          display: 'inline-block',
        }}
      />
      {count}
    </span>
  )
}

export function DashboardLista({ mapas }: Props) {
  const [tab, setTab] = useState<Tab>('todos')
  const [periodo, setPeriodo] = useState<Periodo>('todos')
  const [pagina, setPagina] = useState(1)

  // Filtro de período
  const agora = new Date()
  const mapasFiltradosPeriodo = mapas.filter((m) => {
    if (periodo === 'todos') return true
    const dias = parseInt(periodo)
    const criado = new Date(m.criado_em)
    const diff = (agora.getTime() - criado.getTime()) / (1000 * 60 * 60 * 24)
    return diff <= dias
  })

  // Filtro de tab
  const mapasFiltrados = mapasFiltradosPeriodo.filter((m) => {
    const areas = m.areas ?? []
    if (tab === 'com-vermelho') return areas.some((a) => a.status === 'vermelho')
    if (tab === 'equilibrados') return areas.every((a) => a.status !== 'vermelho')
    return true
  })

  // Paginação
  const totalPaginas = Math.max(1, Math.ceil(mapasFiltrados.length / MAPAS_POR_PAGINA))
  const paginaAtual = Math.min(pagina, totalPaginas)
  const inicio = (paginaAtual - 1) * MAPAS_POR_PAGINA
  const mapasPagina = mapasFiltrados.slice(inicio, inicio + MAPAS_POR_PAGINA)

  const irParaPagina = (p: number) => setPagina(Math.max(1, Math.min(p, totalPaginas)))

  // Reset página ao trocar filtros
  const setTabReset = (t: Tab) => { setTab(t); setPagina(1) }
  const setPeriodoReset = (p: Periodo) => { setPeriodo(p); setPagina(1) }

  if (mapas.length === 0) {
    return (
      <div
        className="flex flex-col items-center gap-4 rounded-card bg-white py-16 text-center"
        style={{ border: '0.5px solid #c8d8d2' }}
      >
        <p className="text-muted-foreground">Você ainda não tem nenhum mapa.</p>
        <Button asChild>
          <Link href="/mapa/preparacao">Criar meu primeiro mapa</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Controles: tabs + filtro de período */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        {/* Tabs */}
        <div className="flex items-center gap-1" style={{ background: '#fff', border: '0.5px solid #c8d8d2', borderRadius: 8, padding: 3 }}>
          {([
            { value: 'todos', label: 'Todos' },
            { value: 'com-vermelho', label: 'Com vermelho' },
            { value: 'equilibrados', label: 'Equilibrados' },
          ] as { value: Tab; label: string }[]).map((t) => (
            <button
              key={t.value}
              onClick={() => setTabReset(t.value)}
              className="text-sm px-3 py-1.5 transition-colors duration-150"
              style={{
                borderRadius: 6,
                fontWeight: tab === t.value ? 500 : 400,
                backgroundColor: tab === t.value ? '#EDF2EF' : 'transparent',
                color: tab === t.value ? '#2A3F45' : '#6f8f87',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Dropdown de período */}
        <select
          value={periodo}
          onChange={(e) => setPeriodoReset(e.target.value as Periodo)}
          className="text-sm px-3 py-1.5 bg-white outline-none cursor-pointer"
          style={{
            border: '0.5px solid #c8d8d2',
            borderRadius: 8,
            color: '#2A3F45',
          }}
        >
          {PERIODOS.map((p) => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>
      </div>

      {/* Lista */}
      {mapasPagina.length === 0 ? (
        <div
          className="flex flex-col items-center gap-2 rounded-card bg-white py-12 text-center"
          style={{ border: '0.5px solid #c8d8d2' }}
        >
          <p className="text-sm text-muted-foreground">Nenhum mapa encontrado para esse filtro.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {mapasPagina.map((mapa) => {
            const totais = { verde: 0, amarelo: 0, vermelho: 0 }
            for (const area of mapa.areas ?? []) totais[area.status]++
            const data = new Date(mapa.criado_em).toLocaleDateString('pt-BR')

            return (
              <div
                key={mapa.id}
                className="rounded-card bg-white px-9 py-6"
                style={{ border: '0.5px solid #c8d8d2' }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-mt-black">{mapa.titulo || 'Mapa da Vida'}</p>
                    <p className="text-xs text-muted-foreground">{data}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusPill count={totais.verde} tipo="verde" />
                    <StatusPill count={totais.amarelo} tipo="amarelo" />
                    <StatusPill count={totais.vermelho} tipo="vermelho" />
                  </div>
                </div>
                <div
                  className="mt-4 flex gap-4 border-t pt-3"
                  style={{ borderColor: '#e8f0ed' }}
                >
                  <Link
                    href={`/mapa/${mapa.id}`}
                    className="flex items-center gap-1.5 text-sm font-medium transition-colors duration-200"
                    style={{ color: '#57AA8F' }}
                  >
                    <Eye className="size-4" />
                    Ver mapa
                  </Link>
                  <Link
                    href={`/diagnostico/${mapa.id}`}
                    className="flex items-center gap-1.5 text-sm transition-colors duration-200"
                    style={{ color: '#6f8f87' }}
                  >
                    <FileText className="size-4" />
                    Diagnóstico completo
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Paginação */}
      {totalPaginas > 1 && (
        <div className="flex items-center justify-center gap-1.5 pt-2">
          <button
            onClick={() => irParaPagina(paginaAtual - 1)}
            disabled={paginaAtual === 1}
            className="flex size-8 items-center justify-center rounded-lg text-sm transition-colors disabled:opacity-30"
            style={{ border: '0.5px solid #c8d8d2', background: '#fff', color: '#2A3F45' }}
          >
            <ChevronLeft className="size-4" />
          </button>

          {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => irParaPagina(p)}
              className="flex size-8 items-center justify-center rounded-lg text-sm font-medium transition-colors"
              style={{
                backgroundColor: p === paginaAtual ? '#57AA8F' : '#fff',
                color: p === paginaAtual ? '#fff' : '#2A3F45',
                border: p === paginaAtual ? 'none' : '0.5px solid #c8d8d2',
              }}
            >
              {p}
            </button>
          ))}

          <button
            onClick={() => irParaPagina(paginaAtual + 1)}
            disabled={paginaAtual === totalPaginas}
            className="flex size-8 items-center justify-center rounded-lg text-sm transition-colors disabled:opacity-30"
            style={{ border: '0.5px solid #c8d8d2', background: '#fff', color: '#2A3F45' }}
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      )}
    </div>
  )
}
