import type { Paragrafo } from '@/lib/quiz/tipos'
import { TextoQuiz, type TemaQuiz } from './TextoQuiz'

// Renderiza a sequencia de Paragrafo (texto corrido ou grupo-lista) de uma
// tela do quiz.
//
// Prosa longa, no padrao da LP /trilha (carta do guia, respostas do FAQ): Lora
// reta em caixa normal — paragrafo inteiro minusculo cansa a leitura. Em fundo
// claro, verde escuro (leitura primaria); no escuro, off-white a 85%, como o
// subtitulo do hero.
//
// - string vira paragrafo normal.
// - string[] vira lista com marcador — e o agrupamento que separa
//   "Comprou uma agenda. / Baixou aplicativos. / Fez listas." de virar uma
//   coluna de linhas soltas sem hierarquia nenhuma. Ver Paragrafo em
//   lib/quiz/tipos.ts.
// - o paragrafo inteiro em **negrito** (a "virada" do texto) sai em Lora 600.
//   Sem barra lateral: na LP, traco grosso e so ilustracao ou estado.

const COR: Record<TemaQuiz, string> = {
  claro: 'text-mt-green-dark',
  escuro: 'text-mt-off-white/85',
}

export function BlocoTexto({
  paragrafos,
  tema = 'claro',
}: {
  paragrafos: Paragrafo[]
  tema?: TemaQuiz
}) {
  const texto = `font-editorial text-[17px] leading-[1.75] sm:text-lg ${COR[tema]}`

  return (
    <div className="space-y-4">
      {paragrafos.map((paragrafo, i) => {
        if (Array.isArray(paragrafo)) {
          return (
            <ul key={i} className="space-y-1.5 py-1">
              {paragrafo.map((linha, j) => (
                <li key={j} className={`flex items-start gap-3 ${texto}`}>
                  <span
                    className="mt-[13px] h-1.5 w-1.5 shrink-0 rounded-full bg-mt-green"
                    aria-hidden="true"
                  />
                  <span>
                    <TextoQuiz texto={linha} tema={tema} />
                  </span>
                </li>
              ))}
            </ul>
          )
        }

        return (
          <p key={i} className={texto}>
            <TextoQuiz texto={paragrafo} tema={tema} />
          </p>
        )
      })}
    </div>
  )
}
