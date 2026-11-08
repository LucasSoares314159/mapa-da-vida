import type { TemaQuiz } from './TextoQuiz'

// Barra de progresso do quiz.
//
// Mede a posicao no fluxo, nao as respostas preenchidas — ver
// progressoDoPasso() em lib/quiz/passos.ts. O denominador conta so as
// perguntas: as telas de copy nao sao etapas que a pessoa cumpre.
//
// Rotulo em Lora minuscula de apoio, como os rotulos da LP /trilha (a caixa
// alta espacada saiu do sistema). No tema escuro (ponte), trilho e rotulo
// clareiam para continuar legiveis sobre o verde escuro.

type Props = {
  fracao: number
  rotulo: string
  tema?: TemaQuiz
}

export function ProgressoQuiz({ fracao, rotulo, tema = 'claro' }: Props) {
  const porcento = Math.round(fracao * 100)
  const escuro = tema === 'escuro'

  return (
    <div className="w-full">
      <div
        className={`h-1.5 w-full overflow-hidden rounded-full ${escuro ? 'bg-white/15' : 'bg-mt-border/60'}`}
        role="progressbar"
        aria-valuenow={porcento}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Progresso do diagnóstico"
      >
        <div
          className="h-full rounded-full bg-mt-green transition-[width] duration-500 ease-out motion-reduce:transition-none"
          style={{ width: `${porcento}%` }}
        />
      </div>
      {rotulo && (
        <p
          className={`mt-1.5 font-editorial text-sm lowercase ${escuro ? 'text-mt-off-white/70' : 'text-mt-apoio'}`}
        >
          {rotulo}
        </p>
      )}
    </div>
  )
}
