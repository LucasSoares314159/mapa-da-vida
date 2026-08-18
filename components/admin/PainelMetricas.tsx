'use client'

import { useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import type { Metricas, VisaoTurma, IdPeriodo } from '@/lib/metricas'
import { PERIODOS } from '@/lib/metricas'
import { MODULOS } from '@/lib/modulos'
import { Funil } from './Funil'
import { DistribuicaoModulos } from './DistribuicaoModulos'
import { Dedicacao } from './Dedicacao'

type Aba = 'todas' | 'turma1' | 'turma2'

/**
 * Painel único com seletor de turma e período — no lugar de um bloco por turma
 * empilhado, que tomava a tela inteira para repetir a mesma estrutura.
 */
export function PainelMetricas({
  metricas,
  periodo,
}: {
  metricas: Metricas
  periodo: IdPeriodo
}) {
  const [aba, setAba] = useState<Aba>('turma2')
  const router = useRouter()
  const params = useSearchParams()
  const [carregando, iniciar] = useTransition()

  const turma: VisaoTurma = metricas[aba]

  // O período recarrega no servidor: as métricas vêm do banco, não do cliente.
  function trocarPeriodo(id: IdPeriodo) {
    const novo = new URLSearchParams(params.toString())
    if (id === 'tudo') novo.delete('periodo')
    else novo.set('periodo', id)
    iniciar(() => router.replace(`/admin?${novo.toString()}`, { scroll: false }))
  }

  return (
    <section className="flex flex-col gap-4">
      {/* Seletores */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1 rounded-lg border border-mt-border bg-mt-surface p-1">
          {([
            ['turma2', `Turma 2 (${metricas.turma2.total})`],
            ['turma1', `Turma 1 (${metricas.turma1.total})`],
            ['todas', `Todas (${metricas.todas.total})`],
          ] as const).map(([valor, rotulo]) => (
            <button
              key={valor}
              type="button"
              onClick={() => setAba(valor)}
              className="rounded px-3 py-1.5 text-xs font-medium transition-colors"
              style={
                aba === valor
                  ? { backgroundColor: '#57AA8F', color: '#fff' }
                  : { color: '#6f8f87' }
              }
            >
              {rotulo}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {carregando && <span className="text-xs text-mt-muted">atualizando…</span>}
          <div className="flex gap-1 rounded-lg border border-mt-border bg-mt-surface p-1">
            {PERIODOS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => trocarPeriodo(p.id)}
                className="rounded px-2.5 py-1.5 text-xs font-medium transition-colors"
                style={
                  periodo === p.id
                    ? { backgroundColor: '#2A3F45', color: '#fff' }
                    : { color: '#6f8f87' }
                }
              >
                {p.rotulo}
              </button>
            ))}
          </div>
        </div>
      </div>

      <p className="text-xs text-mt-muted">{turma.descricao}</p>

      {turma.total === 0 ? (
        <p className="rounded-lg border border-mt-border bg-mt-surface px-4 py-3 text-sm text-mt-muted">
          Nenhum aluno nesta turma.
        </p>
      ) : (
        <>
          {/* Números */}
          <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
            <Mini rotulo="Média de módulos" valor={`${turma.mediaModulos}/${MODULOS.length}`} />
            <Mini rotulo="Concluíram tudo" valor={turma.concluiramTrilha} />
            <Mini
              rotulo="Ativos (7d)"
              valor={turma.temDataReal ? turma.ativos7d : '—'}
              sublabel={turma.temDataReal ? 'concluíram alguma aula' : 'sem data real'}
            />
            <Mini
              rotulo="Em risco"
              valor={turma.temDataReal ? turma.emRisco : '—'}
              sublabel={turma.temDataReal ? '7+ dias parados' : 'sem data real'}
              tom={
                turma.temDataReal && turma.emRisco > turma.total * 0.45 ? 'critico' : 'alerta'
              }
            />
          </div>

          {/* Dedicação */}
          <div className="flex flex-col gap-2">
            <h3 className="text-[11px] font-medium uppercase tracking-wider text-mt-muted">
              Dedicação · retorno e consistência
            </h3>
            <Dedicacao turma={turma} />
          </div>

          {/* Funil */}
          <div className="flex flex-col gap-2">
            <h3 className="text-[11px] font-medium uppercase tracking-wider text-mt-muted">
              Funil de ativação · cumulativo
            </h3>
            <Funil etapas={turma.funil} />
          </div>

          {/* Alcance + distribuição, lado a lado */}
          <div className="grid gap-3 lg:grid-cols-2">
            <div className="flex flex-col gap-2">
              <h3 className="text-[11px] font-medium uppercase tracking-wider text-mt-muted">
                Alcance · em qualquer ordem
              </h3>
              <div className="flex flex-col gap-1.5 rounded-lg border border-mt-border bg-mt-surface p-4">
                {turma.alcance.map((a) => (
                  <div key={a.rotulo} className="flex items-baseline justify-between gap-3">
                    <span className="truncate text-xs text-mt-muted">{a.rotulo}</span>
                    <span
                      className="text-xs font-semibold tabular-nums"
                      style={{ color: '#1a2e29' }}
                    >
                      {a.valor}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <h3 className="text-[11px] font-medium uppercase tracking-wider text-mt-muted">
                Onde pararam
              </h3>
              <DistribuicaoModulos itens={turma.distribuicao} />
            </div>
          </div>
        </>
      )}
    </section>
  )
}

function Mini({
  rotulo,
  valor,
  sublabel,
  tom = 'neutro',
}: {
  rotulo: string
  valor: string | number
  sublabel?: string
  tom?: 'neutro' | 'alerta' | 'critico'
}) {
  const cor = tom === 'critico' ? '#C05050' : tom === 'alerta' ? '#D4A843' : '#1a2e29'
  return (
    <div className="flex flex-col gap-0.5 rounded-lg border border-mt-border bg-mt-surface px-3 py-2.5">
      <span className="text-[10px] font-medium uppercase tracking-wider text-mt-muted">
        {rotulo}
      </span>
      <span className="font-heading text-lg font-bold tabular-nums" style={{ color: cor }}>
        {valor}
      </span>
      {sublabel && <span className="text-[10px] text-mt-muted">{sublabel}</span>}
    </div>
  )
}
