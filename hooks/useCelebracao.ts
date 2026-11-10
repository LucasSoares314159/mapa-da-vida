'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

// Som e vibração da celebração ao marcar um hábito.
//
// O som vem ligado por padrão: a recompensa forte é o ponto da feature. A
// preferência fica no aparelho (localStorage), não no banco — é conforto de
// quem está com o celular na mão, não dado da pessoa.

export const CHAVE_SOM_HABITOS = 'habitos-som'

export type TipoCelebracao = 'marcar' | 'semana' | 'dia'

// Notas (Hz) de cada momento: duas ao marcar, três ao fechar a semana, quatro
// no dia completo. Intervalos de quinta e oitava soam como "acerto".
const NOTAS: Record<TipoCelebracao, number[]> = {
  marcar: [783.99, 1174.66],
  semana: [659.25, 987.77, 1318.51],
  dia: [659.25, 783.99, 987.77, 1318.51],
}

const VIBRACAO: Record<TipoCelebracao, number | number[]> = {
  marcar: 15,
  semana: [15, 40, 25],
  dia: [18, 50, 18, 50, 30],
}

export function lerSomLigado(): boolean {
  try {
    return window.localStorage.getItem(CHAVE_SOM_HABITOS) !== 'desligado'
  } catch {
    return true
  }
}

export function gravarSomLigado(ligado: boolean) {
  try {
    window.localStorage.setItem(CHAVE_SOM_HABITOS, ligado ? 'ligado' : 'desligado')
  } catch {
    // Navegação privada ou storage bloqueado: a preferência só não persiste.
  }
}

export function useCelebracao() {
  const ctxRef = useRef<AudioContext | null>(null)
  const [somLigado, setSomLigado] = useState(true)

  useEffect(() => {
    setSomLigado(lerSomLigado())
  }, [])

  useEffect(() => () => {
    ctxRef.current?.close().catch(() => {})
  }, [])

  const tocar = useCallback(
    (tipo: TipoCelebracao) => {
      if (!somLigado) return
      try {
        const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
        if (!Ctx) return
        ctxRef.current = ctxRef.current ?? new Ctx()
        const ctx = ctxRef.current
        NOTAS[tipo].forEach((freq, i) => {
          const osc = ctx.createOscillator()
          const ganho = ctx.createGain()
          const t = ctx.currentTime + i * 0.09
          osc.type = 'triangle'
          osc.frequency.value = freq
          ganho.gain.setValueAtTime(0.0001, t)
          ganho.gain.exponentialRampToValueAtTime(0.12, t + 0.015)
          ganho.gain.exponentialRampToValueAtTime(0.0001, t + 0.28)
          osc.connect(ganho)
          ganho.connect(ctx.destination)
          osc.start(t)
          osc.stop(t + 0.3)
        })
      } catch {
        // Áudio é enfeite: falhar aqui nunca pode atrapalhar a marcação.
      }
    },
    [somLigado]
  )

  const vibrar = useCallback((tipo: TipoCelebracao | 'desmarcar') => {
    try {
      // iPhone não implementa navigator.vibrate; no Android vibra.
      navigator.vibrate?.(tipo === 'desmarcar' ? 8 : VIBRACAO[tipo])
    } catch {
      // idem
    }
  }, [])

  const celebrar = useCallback(
    (tipo: TipoCelebracao) => {
      tocar(tipo)
      vibrar(tipo)
    },
    [tocar, vibrar]
  )

  return { celebrar, vibrar }
}
