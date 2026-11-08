'use client'

import { AnimatePresence, motion } from 'motion/react'
import { PROFISSOES_ONBOARDING } from '@/lib/validations'
import type { GrupoProfissao } from '@/types'

export type PerfilRascunho = {
  data_nascimento: string
  profissao: GrupoProfissao | ''
  profissao_outro: string
}

type Props = {
  perfil: PerfilRascunho
  revelado: boolean
  erro?: string | null
  onChange: (perfil: PerfilRascunho) => void
}

export function PassoPerfil({ perfil, revelado, erro, onChange }: Props) {
  return (
    <AnimatePresence>
      {revelado && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="mt-8 flex flex-col gap-6"
        >
          {/* Data de nascimento */}
          <div>
            <label
              htmlFor="data_nascimento"
              className="mb-2 block text-sm text-mt-off-white"
            >
              Sua data de nascimento
            </label>
            <input
              id="data_nascimento"
              type="date"
              required
              value={perfil.data_nascimento}
              max={new Date().toISOString().slice(0, 10)}
              onChange={(e) => onChange({ ...perfil, data_nascimento: e.target.value })}
              className="campo-escuro [color-scheme:dark]"
            />
          </div>

          {/* Profissão */}
          <div>
            <label htmlFor="profissao" className="mb-2 block text-sm text-mt-off-white">
              O que você faz hoje
            </label>
            <select
              id="profissao"
              required
              value={perfil.profissao}
              onChange={(e) =>
                onChange({ ...perfil, profissao: e.target.value as GrupoProfissao })
              }
              className={`campo-escuro ${perfil.profissao ? '' : 'text-mt-off-white/60'}`}
            >
              <option value="" disabled className="text-mt-green-dark">
                Selecione uma opção
              </option>
              {PROFISSOES_ONBOARDING.map((p) => (
                <option key={p} value={p} className="text-mt-green-dark">
                  {p}
                </option>
              ))}
            </select>
          </div>

          {/* Campo livre, só quando "Outro" */}
          <AnimatePresence>
            {perfil.profissao === 'Outro' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <label
                  htmlFor="profissao_outro"
                  className="mb-2 block text-sm text-mt-off-white"
                >
                  Conte qual é a sua profissão
                </label>
                <input
                  id="profissao_outro"
                  type="text"
                  maxLength={80}
                  value={perfil.profissao_outro}
                  onChange={(e) => onChange({ ...perfil, profissao_outro: e.target.value })}
                  placeholder="Ex: professora de yoga"
                  className="campo-escuro"
                />
              </motion.div>
            )}
          </AnimatePresence>

          {erro && (
            <p role="alert" className="text-sm text-[#E68A8A]">
              {erro}
            </p>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
