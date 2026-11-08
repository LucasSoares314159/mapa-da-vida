import type { GarantiaVsl } from '@/lib/quiz/tipos'
import { TextoQuiz } from './TextoQuiz'

// Bloco de garantia abaixo do CTA da VSL.
//
// A garantia e prova de remocao de risco — o empurrao final depois que a
// pessoa ja viu a oferta —, entao fica DEPOIS do botao, nao antes, e tem peso
// visual proprio (selo + headline + reforco) em vez de uma linha apagada no
// rodape.
//
// Linguagem das secoes escuras da LP /trilha: superficie escura sobre fundo
// escuro, sem borda; eyebrow em Lora minuscula (a caixa alta espacada saiu do
// sistema); titulo em Satoshi 500 minusculo com o *destaque* em --verde 700;
// o texto e prosa, entao Lora em caixa normal. A enfase vem de TextoQuiz no
// tema escuro — **negrito** off-white, *destaque* verde.

export function BlocoGarantia({ garantia }: { garantia: GarantiaVsl }) {
  return (
    <div className="mt-10 w-full max-w-[440px] rounded-painel bg-white/[0.06] px-6 py-8 text-center sm:px-8">
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

      <p className="font-editorial text-base lowercase text-mt-off-white/70">{garantia.eyebrow}</p>

      <h2 className="mt-2 font-satoshi text-[26px] font-medium lowercase leading-[1.12] tracking-[-0.02em] text-mt-off-white [text-wrap:balance] sm:text-[30px]">
        <TextoQuiz texto={garantia.titulo} tema="escuro" />
      </h2>

      <div className="mt-4 space-y-3">
        {garantia.texto.map((paragrafo, i) => (
          <p key={i} className="font-editorial text-base leading-[1.7] text-mt-off-white/80">
            <TextoQuiz texto={paragrafo} tema="escuro" />
          </p>
        ))}
      </div>
    </div>
  )
}
