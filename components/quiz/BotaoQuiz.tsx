import type { ButtonHTMLAttributes } from 'react'
import type { TemaQuiz } from './TextoQuiz'

// Botao de avanco do funil, no padrao do .btn-cta da LP /trilha: pilula
// (999px, nao 50%, que vira elipse no botao largo do mobile), --verde com texto
// branco, DM Sans 500 16px, sem caixa alta espacada — o texto sai como esta na
// config. Branco sobre --verde (2.78:1) e direcionamento de marca assumido na
// LP: nao "corrija" para preto sem conversar.
//
// O foco muda com o fundo: verde escuro no claro, off-white no escuro (o mesmo
// par do .btn-cta e do .btn-cta-hero).

type Props = ButtonHTMLAttributes<HTMLButtonElement> & { tema?: TemaQuiz }

export function BotaoQuiz({ tema = 'claro', className = '', ...props }: Props) {
  const foco =
    tema === 'escuro'
      ? 'focus-visible:outline-mt-off-white'
      : 'focus-visible:outline-mt-green-dark'

  return (
    <button
      type="button"
      {...props}
      className={`min-h-11 w-full rounded-full bg-mt-green px-10 py-[18px] font-sans text-base font-medium leading-tight text-white transition-opacity hover:opacity-90 active:translate-y-px active:opacity-85 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto ${foco} ${className}`}
    />
  )
}
