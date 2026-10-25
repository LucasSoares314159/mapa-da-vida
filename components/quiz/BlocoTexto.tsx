import type { Paragrafo } from '@/lib/quiz/tipos'
import { TextoQuiz } from './TextoQuiz'

// Renderiza a sequencia de Paragrafo (texto corrido ou grupo-lista) de uma
// tela do quiz, com boas praticas de escaneabilidade:
//
// - string vira paragrafo normal.
// - string[] vira lista com marcador — e o agrupamento que separa
//   "Comprou uma agenda. / Baixou aplicativos. / Fez listas." de virar uma
//   coluna de linhas soltas sem hierarquia nenhuma. Ver Paragrafo em
//   lib/quiz/tipos.ts.
// - o paragrafo em **negrito** (a "virada" do texto, ex. "Talvez voce nao
//   precise de mais um planejamento...") ganha uma leve barra lateral: e a
//   frase que mais importa escanear ao passar o olho rapido pela tela.

export function BlocoTexto({ paragrafos }: { paragrafos: Paragrafo[] }) {
  return (
    <div className="space-y-4">
      {paragrafos.map((paragrafo, i) => {
        if (Array.isArray(paragrafo)) {
          return (
            <ul key={i} className="space-y-1.5 py-1">
              {paragrafo.map((linha, j) => (
                <li
                  key={j}
                  className="flex items-start gap-2.5 text-base leading-7 text-mt-green-dark sm:text-[17px]"
                >
                  <span className="mt-[11px] h-1.5 w-1.5 shrink-0 rounded-full bg-mt-green" aria-hidden="true" />
                  <TextoQuiz texto={linha} />
                </li>
              ))}
            </ul>
          )
        }

        const ehDestaque = paragrafo.startsWith('**') && paragrafo.endsWith('**')

        if (ehDestaque) {
          return (
            <p
              key={i}
              className="border-l-[3px] border-mt-green py-0.5 pl-4 text-base leading-7 text-mt-black sm:text-[17px]"
            >
              <TextoQuiz texto={paragrafo} />
            </p>
          )
        }

        return (
          <p key={i} className="text-base leading-7 text-mt-green-dark sm:text-[17px]">
            <TextoQuiz texto={paragrafo} />
          </p>
        )
      })}
    </div>
  )
}
