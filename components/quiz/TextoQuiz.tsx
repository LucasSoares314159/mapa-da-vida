import { Fragment } from 'react'

// Renderiza a enfase dos textos vindos da config.
//
// Os textos sao copiados literalmente dos docs, que marcam enfase com asterisco.
// Converter na mao em JSX perderia a correspondencia linha a linha com o doc,
// que e a fonte de verdade e nao pode ser alterada sem aprovacao.
//
// Duas marcas, no padrao da LP /trilha:
// - **negrito** → peso, na cor de leitura primaria do fundo.
// - *destaque*  → o <em> dos titulos da LP: peso 700, sem italico. No fundo
//   escuro ganha o --verde (~4:1, AA de texto grande — so usar em titulo); no
//   claro fica no verde escuro, destacado so pelo peso.

export type TemaQuiz = 'claro' | 'escuro'

export function TextoQuiz({ texto, tema = 'claro' }: { texto: string; tema?: TemaQuiz }) {
  const partes = texto.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g)

  return (
    <>
      {partes.map((parte, i) => {
        if (parte.startsWith('**') && parte.endsWith('**')) {
          return (
            <strong
              key={i}
              className={`font-semibold ${tema === 'escuro' ? 'text-mt-off-white' : 'text-mt-green-dark'}`}
            >
              {parte.slice(2, -2)}
            </strong>
          )
        }
        if (parte.length > 2 && parte.startsWith('*') && parte.endsWith('*')) {
          return (
            <em
              key={i}
              className={`font-bold not-italic ${tema === 'escuro' ? 'text-mt-green' : ''}`}
            >
              {parte.slice(1, -1)}
            </em>
          )
        }
        return <Fragment key={i}>{parte}</Fragment>
      })}
    </>
  )
}
