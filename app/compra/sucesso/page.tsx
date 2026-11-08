import type { Metadata } from 'next'
import Link from 'next/link'
import { Inbox, Mail, MessageCircle } from 'lucide-react'
import { MetaPixel } from '@/components/MetaPixel'
import { PurchasePixel } from '@/components/PurchasePixel'
import { CelebracaoCompra } from '@/components/compra/CelebracaoCompra'
import { getTokenTtlHours } from '@/lib/acesso-compra'
import { ASSUNTO_ACESSO_PLATAFORMA } from '@/lib/email-templates'
import { EMPRESA } from '@/lib/empresa'
import { TEMPO_ESTIMADO_TOTAL } from '@/lib/onboarding'

export const metadata: Metadata = {
  title: 'Compra confirmada',
  // Só faz sentido para quem acabou de pagar: indexada, viraria resultado de
  // busca prometendo um e-mail que ninguém vai receber.
  robots: { index: false, follow: false },
}

// Mesma regra de exibição do e-mail de acesso: dias inteiros quando fecha.
function textoValidade(horas: number): string {
  if (horas % 24 === 0) {
    const dias = horas / 24
    return dias === 1 ? '1 dia' : `${dias} dias`
  }
  return `${horas} horas`
}

// Entrada em sequência do texto do herói. Só CSS (tailwindcss-animate): o
// texto é do servidor e não deve esperar o JS da animação para aparecer.
const ENTRADA =
  'animate-in fade-in slide-in-from-bottom-3 fill-mode-both duration-700 ease-out motion-reduce:animate-none'

const PASSOS = (validade: string) => [
  {
    titulo: 'Abra o e-mail da MindTrail',
    texto: 'Procure pelo assunto acima. Ele vai para o mesmo e-mail que você informou no pagamento.',
  },
  {
    titulo: 'Toque em “Criar minha conta”',
    texto: `Você define seu nome e sua senha. O link é pessoal, vale para um único cadastro e expira em ${validade}.`,
  },
  {
    titulo: 'Comece pelo Mapa da Vida',
    texto: `É a primeira coisa que você faz lá dentro: um diagnóstico de cerca de ${TEMPO_ESTIMADO_TOTAL} sobre as 9 áreas da sua vida. A Trilha parte dele.`,
  },
]

// A referencia vem do redirect do provedor e deduplica o Purchase com o par
// enviado pela CAPI no webhook. session_id mantem links Stripe antigos validos.
export default function CompraSucessoPage({
  searchParams,
}: {
  searchParams: { checkout_ref?: string; session_id?: string }
}) {
  const passos = PASSOS(textoValidade(getTokenTtlHours()))

  return (
    <main className="min-h-screen bg-mt-off-white font-sans text-[17px] leading-[1.75] text-mt-black">
      <MetaPixel comPageView={false} />
      <PurchasePixel idCheckout={searchParams.checkout_ref ?? searchParams.session_id} />

      {/* Herói em verde escuro, como o da LP: a celebração e a confirmação. */}
      <section className="relative overflow-hidden bg-mt-green-dark px-4 pb-16 pt-12 text-center sm:px-8 sm:pb-24 sm:pt-16">
        {/* Halo verde atrás da cena: dá profundidade sem competir com o mascote. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-8 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-mt-green/20 blur-3xl"
        />

        <div className="relative">
          <CelebracaoCompra />

          <p className={`mt-6 font-editorial text-lg lowercase text-mt-off-white/80 ${ENTRADA} delay-300`}>
            pagamento recebido
          </p>
          <h1
            className={`mx-auto mt-2 max-w-[14em] font-satoshi text-[34px] font-medium lowercase leading-[1.08] tracking-[-0.02em] text-mt-off-white [text-wrap:balance] sm:text-[52px] ${ENTRADA} delay-500`}
          >
            Sua vaga na <em className="font-bold not-italic text-mt-green">Trilha</em> está garantida
          </h1>
          <p
            className={`mx-auto mt-5 max-w-[30em] font-editorial text-lg lowercase leading-[1.6] text-mt-off-white/85 [text-wrap:pretty] sm:text-[21px] ${ENTRADA} delay-700`}
          >
            Falta um passo: criar sua conta pelo link que acabamos de mandar para o seu <span className="whitespace-nowrap">e-mail</span>.
          </p>
        </div>
      </section>

      <section className="px-4 pb-20 sm:px-8">
        <div className="mx-auto max-w-[640px]">
          {/* Painel do e-mail: sobe sobre a borda do herói, é o destaque da página. */}
          <div className="relative z-10 -mt-8 rounded-painel border-[0.5px] border-mt-border bg-white px-5 py-8 shadow-mt-3 sm:-mt-12 sm:px-12 sm:py-12">
            <span className="flex h-12 w-12 items-center justify-center rounded-[12px] bg-mt-green-sup text-mt-green-dark">
              <Mail className="h-6 w-6" aria-hidden="true" />
            </span>
            <h2 className="mt-5 font-satoshi text-[26px] font-medium lowercase leading-[1.15] tracking-[-0.02em] text-mt-green-dark sm:text-[30px]">
              Seu acesso chega por <span className="whitespace-nowrap">e-mail</span>
            </h2>
            <p className="mt-3 text-mt-black/80">
              Enviamos o link de acesso para o{' '}
              <strong className="font-semibold text-mt-green-dark">
                <span className="whitespace-nowrap">e-mail</span> que você usou no pagamento
              </strong>
              . Ele costuma chegar em poucos minutos, com este assunto:
            </p>
            <p className="mt-5 flex items-start gap-3 rounded-[12px] border-[0.5px] border-mt-border bg-mt-green-sup px-4 py-3 text-base font-medium leading-snug text-mt-green-dark">
              <Inbox className="mt-0.5 h-5 w-5 shrink-0 text-mt-green" aria-hidden="true" />
              <span>{ASSUNTO_ACESSO_PLATAFORMA}</span>
            </p>
          </div>

          <h2 className="mt-14 font-satoshi text-[26px] font-medium lowercase leading-[1.15] tracking-[-0.02em] text-mt-green-dark sm:text-[30px]">
            Seus próximos passos
          </h2>
          <ol className="mt-6 flex flex-col gap-3">
            {passos.map((passo, i) => (
              <li
                key={passo.titulo}
                className="flex gap-4 rounded-card border-[0.5px] border-mt-border bg-white p-5 shadow-mt-1 sm:gap-5 sm:p-6"
              >
                <span
                  aria-hidden="true"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-mt-green font-satoshi text-base font-bold text-white"
                >
                  {i + 1}
                </span>
                <div>
                  <h3 className="font-heading text-titulo-card font-bold normal-case text-mt-green-dark">
                    {passo.titulo}
                  </h3>
                  <p className="mt-1 text-base leading-[1.65] text-mt-apoio">{passo.texto}</p>
                </div>
              </li>
            ))}
          </ol>

          {/* Ajuda: o medo mais comum depois de pagar é o e-mail não aparecer. */}
          <div className="mt-10 rounded-card border-[0.5px] border-mt-border bg-mt-green-sup p-6 sm:p-8">
            <h2 className="font-satoshi text-[22px] font-medium lowercase leading-[1.2] tracking-[-0.02em] text-mt-green-dark">
              O e-mail não chegou?
            </h2>
            <ul className="mt-3 flex list-disc flex-col gap-2 pl-5 text-base leading-[1.65] text-mt-black/80 marker:text-mt-green">
              <li>Espere alguns minutos e confira as abas Promoções e Atualizações e a pasta de spam.</li>
              <li>
                Se ainda não estiver lá, chame a gente no WhatsApp {EMPRESA.whatsapp} com o e-mail
                da compra. Reenviamos o link.
              </li>
            </ul>
            <a
              href={EMPRESA.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-full border-[1.5px] border-mt-green-dark px-6 py-3 text-base font-medium leading-tight text-mt-green-dark transition-colors hover:bg-mt-green-dark hover:text-mt-off-white focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-mt-green-dark"
            >
              <MessageCircle className="h-5 w-5" aria-hidden="true" />
              Falar no WhatsApp
            </a>
          </div>

          <div className="mt-10 flex flex-col gap-2 text-center text-[15px] leading-6 text-mt-apoio">
            <p>
              Já tem conta na MindTrail?{' '}
              <Link
                href="/auth/login"
                className="font-medium text-mt-green-dark underline decoration-mt-green underline-offset-4 hover:decoration-2"
              >
                Entrar
              </Link>
            </p>
            <p>
              Sua compra tem garantia de 7 dias.{' '}
              <Link
                href="/cancelamento"
                className="font-medium text-mt-green-dark underline decoration-mt-green underline-offset-4 hover:decoration-2"
              >
                Ver política
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}
