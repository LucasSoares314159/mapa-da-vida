import { Fragment } from 'react'
import type { GarantiaVsl } from '@/lib/quiz/tipos'

// Bloco de garantia abaixo do CTA da VSL.
//
// A garantia e prova de remocao de risco — o empurrao final depois que a
// pessoa ja viu a oferta —, entao fica DEPOIS do botao, nao antes, e tem peso
// visual proprio (selo + headline + reforco) em vez de uma linha apagada no
// rodape. Fundo escuro herdado da tela da VSL: o texto e branco e a enfase e
// verde claro, nunca mt-black (que sumiria).

// Enfase local, nao o TextoQuiz compartilhado: aquele e para telas claras
// (negrito em mt-black) e nao faz italico. Aqui **negrito** fica branco forte
// e *italico* vira a cor de destaque, como na headline da referencia.
function TextoEnfase({ texto }: { texto: string }) {
  const partes = texto.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g)

  return (
    <>
      {partes.map((parte, i) => {
        if (parte.startsWith('**') && parte.endsWith('**')) {
          return (
            <strong key={i} className="font-bold text-white">
              {parte.slice(2, -2)}
            </strong>
          )
        }
        if (parte.startsWith('*') && parte.endsWith('*')) {
          return (
            <em key={i} className="font-semibold not-italic text-mt-green">
              {parte.slice(1, -1)}
            </em>
          )
        }
        return <Fragment key={i}>{parte}</Fragment>
      })}
    </>
  )
}

export function BlocoGarantia({ garantia }: { garantia: GarantiaVsl }) {
  return (
    <div className="mt-10 w-full max-w-[440px] rounded-2xl border border-white/15 bg-white/[0.04] px-6 py-8 text-center">
      {garantia.selo && (
        // Selo decorativo de tamanho fixo; next/image so adicionaria peso.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={garantia.selo}
          alt=""
          width={120}
          height={120}
          className="mx-auto mb-5 h-28 w-28 object-contain drop-shadow-[0_4px_16px_rgba(0,0,0,0.4)]"
        />
      )}

      <p className="text-xs font-bold uppercase tracking-widest text-mt-green">
        {garantia.eyebrow}
      </p>

      <h2 className="mt-2 font-heading text-2xl font-bold leading-tight text-white sm:text-[28px]">
        <TextoEnfase texto={garantia.titulo} />
      </h2>

      <div className="mt-4 space-y-3">
        {garantia.texto.map((paragrafo, i) => (
          <p key={i} className="text-sm leading-6 text-white/75 sm:text-[15px]">
            <TextoEnfase texto={paragrafo} />
          </p>
        ))}
      </div>
    </div>
  )
}
