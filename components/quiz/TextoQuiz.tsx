import { Fragment } from 'react'

// Renderiza **negrito** nos paragrafos vindos da config.
//
// Os textos sao copiados literalmente dos docs, que marcam enfase com asterisco
// duplo. Converter na mao em JSX perderia a correspondencia linha a linha com o
// doc, que e a fonte de verdade e nao pode ser alterada sem aprovacao.

export function TextoQuiz({ texto }: { texto: string }) {
  const partes = texto.split(/(\*\*[^*]+\*\*)/g)

  return (
    <>
      {partes.map((parte, i) =>
        parte.startsWith('**') && parte.endsWith('**') ? (
          <strong key={i} className="font-semibold text-mt-black">
            {parte.slice(2, -2)}
          </strong>
        ) : (
          <Fragment key={i}>{parte}</Fragment>
        )
      )}
    </>
  )
}
