'use client'

import { useState } from 'react'
import type { LinhaAluno } from '@/lib/metricas'
import { MODULOS } from '@/lib/modulos'

/**
 * Lista nominal para resgate individual.
 *
 * Mostra quem é a pessoa e onde ela parou, mas nunca as observações do Mapa nem
 * o texto dos objetivos — dá para agir sem ler o que ela escreveu no momento
 * mais vulnerável.
 */
export function TabelaAlunos({ alunos }: { alunos: LinhaAluno[] }) {
  const [soRisco, setSoRisco] = useState(false)
  const [turma, setTurma] = useState<'todas' | 'turma1' | 'turma2'>('todas')

  const visiveis = alunos
    .filter((a) => turma === 'todas' || a.turma === turma)
    .filter((a) => !soRisco || a.emRisco)
  const ordenados = [...visiveis].sort((a, b) => (b.diasParado ?? 0) - (a.diasParado ?? 0))

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-1 rounded-lg border border-mt-border bg-mt-surface p-1">
          {([
            ['todas', 'Todas'],
            ['turma2', 'Turma 2'],
            ['turma1', 'Turma 1'],
          ] as const).map(([valor, rotulo]) => (
            <button
              key={valor}
              type="button"
              onClick={() => setTurma(valor)}
              className="rounded px-3 py-1 text-xs font-medium transition-colors"
              style={
                turma === valor
                  ? { backgroundColor: '#57AA8F', color: '#fff' }
                  : { color: '#6f8f87' }
              }
            >
              {rotulo}
            </button>
          ))}
        </div>

      <label className="flex cursor-pointer items-center gap-2 self-start text-sm text-mt-muted">
        <input
          type="checkbox"
          checked={soRisco}
          onChange={(e) => setSoRisco(e.target.checked)}
          className="h-4 w-4 accent-mt-green"
        />
        Mostrar só quem está em risco
      </label>
      </div>

      <div className="overflow-x-auto rounded-lg border border-mt-border bg-mt-surface">
        <table className="w-full min-w-[900px] text-sm">
          <thead>
            <tr className="border-b border-mt-border bg-mt-off-white">
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-mt-muted">Aluno</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-mt-muted">Turma</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-mt-muted">Onde parou</th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-mt-muted">Dias ativos</th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-mt-muted">Conteúdo</th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-mt-muted">Parado há</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-mt-muted">Artefatos</th>
            </tr>
          </thead>
          <tbody>
            {ordenados.map((a) => (
              <tr key={a.id} className="border-b border-mt-border last:border-0">
                <td className="px-4 py-3">
                  <p className="font-medium" style={{ color: '#1a2e29' }}>{a.nome}</p>
                  <p className="text-xs text-mt-muted">{a.email}</p>
                </td>
                <td className="px-4 py-3">
                  <span
                    className="rounded px-2 py-0.5 text-[11px] font-medium"
                    style={
                      a.turma === 'turma2'
                        ? { backgroundColor: '#E8F1EC', color: '#3F8C74' }
                        : { backgroundColor: '#EDF2EF', color: '#6f8f87' }
                    }
                  >
                    {a.turma === 'turma2' ? 'T2' : 'T1'}
                  </span>
                </td>
                <td className="px-4 py-3 text-mt-muted">
                  {a.ultimoModulo === null
                    ? 'Não começou'
                    : MODULOS[a.ultimoModulo].titulo.replace(/ —.*/, '')}
                  <span className="ml-1 text-xs">({a.modulosConcluidos}/{MODULOS.length})</span>
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-mt-muted">
                  {a.turma === 'turma1' ? '—' : a.diasAtivos || '—'}
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-mt-muted">
                  {a.minutosConteudo
                    ? a.minutosConteudo >= 60
                      ? `${Math.floor(a.minutosConteudo / 60)}h${a.minutosConteudo % 60 ? ` ${a.minutosConteudo % 60}min` : ''}`
                      : `${a.minutosConteudo}min`
                    : '—'}
                </td>
                <td className="px-4 py-3 text-right tabular-nums">
                  <span
                    className="rounded-full px-2 py-1 text-xs font-medium"
                    style={
                      a.turma === 'turma1'
                        ? { backgroundColor: '#EDF2EF', color: '#6f8f87' }
                        : a.emRisco
                        ? { backgroundColor: '#F6E0E0', color: '#C05050' }
                        : { backgroundColor: '#E8F1EC', color: '#3F8C74' }
                    }
                  >
                    {a.turma === 'turma1' ? '—' : `${a.diasParado ?? '—'}d`}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    {([
                      ['Mapa', a.temMapa],
                      ['Momento', a.temMomento],
                      ['Objetivo', a.temObjetivo],
                      ['Rotina', a.temRotina],
                    ] as const).map(([nome, tem]) => (
                      <span
                        key={nome}
                        title={nome}
                        className="rounded px-1.5 py-0.5 text-[10px] font-medium"
                        style={
                          tem
                            ? { backgroundColor: '#E8F1EC', color: '#3F8C74' }
                            : { backgroundColor: '#EDF2EF', color: '#c8d8d2' }
                        }
                      >
                        {nome.slice(0, 3)}
                      </span>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
            {ordenados.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-sm text-mt-muted">
                  Ninguém em risco no momento.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
