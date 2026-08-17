'use client'

import Link from 'next/link'
import { motion } from 'motion/react'
import type { Diagnostico } from '@/lib/analise'

type Props = {
  mapaId: string
  diagnostico: Diagnostico
  onVerMapa: () => void
}

const BORDA_STATUS: Record<'vermelho' | 'amarelo', string> = {
  vermelho: '#C05050',
  amarelo: '#D4A843',
}

/**
 * Sequência de revelação do diagnóstico, estilo carta se abrindo:
 * 1. Selo fechado (breve, cria expectativa)
 * 2. Selo se abre (escala + rotação)
 * 3. Padrão surge como o clímax, grande e centralizado
 * 4. Projeção, escolha e áreas críticas revelam em cascata, em sequência
 */
export function RevelacaoDiagnostico({ mapaId, diagnostico, onVerMapa }: Props) {
  const atrasoBotoes =
    diagnostico.areasDestacadas.length > 0
      ? 3.1 + diagnostico.areasDestacadas.length * 0.15 + 0.5
      : 3.0
  return (
    <div className="flex min-h-screen flex-col items-center px-6 py-16" style={{ backgroundColor: '#2A3F45' }}>
      <div className="mx-auto flex w-full max-w-lg flex-col items-center gap-10">
        {/* Selo: aparece fechado, gira e se abre, depois some. Área reservada
            para não sobrepor o padrão quando some. */}
        <div className="flex items-center justify-center" style={{ height: 72 }}>
          <motion.div
            className="flex items-center justify-center"
            style={{ width: 72, height: 72, borderRadius: '50%', border: '1.5px solid #57AA8F' }}
            initial={{ scale: 0.6, opacity: 0, rotate: -8 }}
            animate={{
              scale: [0.6, 1, 1, 0.85],
              opacity: [0, 1, 1, 0],
              rotate: [-8, 0, 0, 6],
            }}
            transition={{ duration: 1.6, times: [0, 0.35, 0.7, 1], ease: 'easeOut' }}
          >
            <span style={{ color: '#57AA8F', fontSize: 22, fontFamily: 'var(--font-space-grotesk), sans-serif' }}>
              ✦
            </span>
          </motion.div>
        </div>

        {/* Padrão — o clímax, entra logo depois do selo abrir */}
        <motion.p
          className="text-center leading-relaxed"
          style={{
            fontFamily: 'var(--font-lora), Lora, serif',
            fontStyle: 'italic',
            fontSize: '1.35rem',
            color: '#EDF2EF',
            lineHeight: 1.7,
          }}
          initial={{ opacity: 0, scale: 0.92, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 1.1, ease: [0.16, 1, 0.3, 1] }}
        >
          {diagnostico.padrao}
        </motion.p>

        {/* Projeção */}
        <motion.div
          className="flex flex-col gap-4"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 2.1, ease: 'easeOut' }}
        >
          {diagnostico.projecao.map((paragrafo, i) => (
            <p
              key={i}
              className="text-center leading-relaxed"
              style={{ fontSize: '0.95rem', color: 'rgba(237,242,239,0.8)', lineHeight: 1.7 }}
            >
              {paragrafo}
            </p>
          ))}
        </motion.div>

        {/* Escolha */}
        <motion.p
          className="text-center leading-relaxed"
          style={{
            fontFamily: 'var(--font-lora), Lora, serif',
            fontStyle: 'italic',
            fontSize: '1rem',
            color: '#EDF2EF',
            lineHeight: 1.7,
            borderTop: '0.5px solid rgba(237,242,239,0.15)',
            paddingTop: 28,
          }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 2.6, ease: 'easeOut' }}
        >
          {diagnostico.escolha}
        </motion.p>

        {/* Áreas críticas — fundamento e evidência */}
        {diagnostico.areasDestacadas.length > 0 && (
          <motion.div
            className="flex w-full flex-col gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 3.1 }}
          >
            {diagnostico.areasDestacadas.map(({ nome, status, base }, i) => (
              <motion.div
                key={nome}
                className="flex flex-col gap-2.5"
                style={{
                  backgroundColor: 'rgba(237,242,239,0.05)',
                  border: '0.5px solid rgba(237,242,239,0.12)',
                  borderRadius: 12,
                  padding: '20px 22px',
                }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 3.2 + i * 0.15 }}
              >
                <div className="flex items-center gap-2">
                  <span
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: '50%',
                      backgroundColor: status === 'vermelho' ? BORDA_STATUS.vermelho : BORDA_STATUS.amarelo,
                      flexShrink: 0,
                      display: 'inline-block',
                    }}
                  />
                  <h3 className="text-sm font-semibold" style={{ color: '#EDF2EF' }}>
                    {nome}
                  </h3>
                </div>

                <p style={{ fontSize: '0.9rem', color: 'rgba(237,242,239,0.85)', lineHeight: 1.65 }}>
                  {base.fundamento}
                </p>

                <p
                  style={{
                    fontSize: '0.85rem',
                    color: 'rgba(237,242,239,0.7)',
                    lineHeight: 1.65,
                    borderLeft: '2px solid #57AA8F',
                    paddingLeft: 14,
                  }}
                >
                  {base.destaque}
                </p>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Ações finais */}
        <motion.div
          className="flex w-full flex-col items-center gap-3"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: atrasoBotoes }}
        >
          <button
            onClick={onVerMapa}
            className="flex items-center gap-2 text-white transition-opacity hover:opacity-90"
            style={{
              backgroundColor: '#57AA8F',
              borderRadius: 10,
              padding: '14px 28px',
              fontSize: 15,
              fontWeight: 500,
            }}
          >
            Ver mapa completo →
          </button>

          <Link
            href={`/diagnostico/${mapaId}`}
            className="text-sm font-medium transition-opacity hover:opacity-80"
            style={{ color: 'rgba(237,242,239,0.7)' }}
          >
            Ver diagnóstico completo
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
