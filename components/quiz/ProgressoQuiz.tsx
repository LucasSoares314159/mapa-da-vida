// Barra de progresso do quiz.
//
// Mede a posicao no fluxo, nao as respostas preenchidas — ver
// progressoDoPasso() em lib/quiz/passos.ts. O denominador conta so as
// perguntas: as telas de copy nao sao etapas que a pessoa cumpre.

type Props = {
  fracao: number
  rotulo: string
}

export function ProgressoQuiz({ fracao, rotulo }: Props) {
  const porcento = Math.round(fracao * 100)

  return (
    <div className="w-full">
      <div
        className="h-1.5 w-full overflow-hidden rounded-full bg-mt-border/60"
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
        <p className="mt-2 text-xs font-medium uppercase tracking-wide text-mt-muted">{rotulo}</p>
      )}
    </div>
  )
}
