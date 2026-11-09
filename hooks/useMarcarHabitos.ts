'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { definirHabitoHoje } from '@/app/actions/habitos'
import { useCelebracao } from '@/hooks/useCelebracao'
import type { IconeHabito } from '@/types'

// Marcação dos hábitos de hoje, compartilhada pela tela Hoje (/habitos) e pela
// faixa no topo da Trilha (/content): estado otimista, celebração, avisos e a
// fila de gravação por hábito.

export type HabitoDoDia = {
  id: string
  nome: string
  icone: IconeHabito
  meta: number
  /** Feitos na semana corrente sem contar hoje. */
  feitosAntesDeHoje: number
  feitoHoje: boolean
}

export type Celebrando = { id: string; tipo: 'marcar' | 'semana' } | null

export function useMarcarHabitos(habitos: HabitoDoDia[], opcoes: { onDiaCompleto?: () => void } = {}) {
  const router = useRouter()
  const { celebrar, vibrar } = useCelebracao()

  const [feitos, setFeitos] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(habitos.map((h) => [h.id, h.feitoHoje]))
  )
  const [celebrando, setCelebrando] = useState<Celebrando>(null)
  const [aviso, setAviso] = useState('')
  const [jaMarcou, setJaMarcou] = useState(false)

  const timers = useRef<ReturnType<typeof setTimeout>[]>([])
  // Uma fila por hábito: cada gravação espera a anterior do mesmo hábito, para
  // marcar e desmarcar rápido não chegarem ao servidor fora de ordem.
  const filas = useRef(new Map<string, Promise<unknown>>())

  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  function depois(ms: number, fn: () => void) {
    timers.current.push(setTimeout(fn, ms))
  }

  function avisar(msg: string) {
    setAviso(msg)
    depois(2200, () => setAviso((atual) => (atual === msg ? '' : atual)))
  }

  function alternar(h: HabitoDoDia) {
    const novo = !feitos[h.id]
    const proximos = { ...feitos, [h.id]: novo }
    setFeitos(proximos)

    if (novo) {
      setJaMarcou(true)
      const fechouSemana = h.feitosAntesDeHoje + 1 === h.meta
      const diaCompleto = habitos.every((x) => proximos[x.id])
      celebrar(diaCompleto ? 'dia' : fechouSemana ? 'semana' : 'marcar')
      setCelebrando({ id: h.id, tipo: fechouSemana ? 'semana' : 'marcar' })
      depois(1000, () => setCelebrando((c) => (c?.id === h.id ? null : c)))
      if (diaCompleto && opcoes.onDiaCompleto) {
        opcoes.onDiaCompleto()
      } else if (diaCompleto) {
        avisar('Dia completo.')
      } else if (fechouSemana && h.meta < 7) {
        avisar('Meta da semana cumprida.')
      }
    } else {
      vibrar('desmarcar')
    }

    const anterior = filas.current.get(h.id) ?? Promise.resolve()
    const atual = anterior.then(async () => {
      const r = await definirHabitoHoje(h.id, novo)
      if ('redirectTo' in r) {
        router.push(r.redirectTo)
        return
      }
      if ('error' in r) {
        // Desfaz só se a tela ainda mostra o que falhou: um toque depois pode
        // já ter levado o hábito de volta ao estado do servidor.
        setFeitos((f) => (f[h.id] === novo ? { ...f, [h.id]: !novo } : f))
        avisar(r.error)
      }
    })
    filas.current.set(h.id, atual)
  }

  return { feitos, celebrando, aviso, avisar, alternar, jaMarcou, depois }
}
