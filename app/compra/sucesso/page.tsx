import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MetaPixel } from '@/components/MetaPixel'
import { PurchasePixel } from '@/components/PurchasePixel'

export const metadata = {
  title: 'Pagamento confirmado | MindTrail',
}
// O session_id vem do redirect do Stripe e e o que deduplica o Purchase com o
// par enviado pela CAPI no webhook.
export default function CompraSucessoPage({
  searchParams,
}: {
  searchParams: { session_id?: string }
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-mt-off-white px-4">
      <MetaPixel
        pixelId={process.env.NEXT_PUBLIC_META_PIXEL_QUIZ_ID}
        comPageView={false}
        id="meta-pixel-compra"
      />
      <PurchasePixel idSessao={searchParams.session_id} />
      <section className="w-full max-w-lg text-center">
        <CheckCircle2 className="mx-auto mb-6 h-12 w-12 text-mt-green" aria-hidden="true" />
        <h1 className="text-3xl font-semibold text-mt-dark">Pagamento recebido</h1>
        <p className="mt-4 text-base leading-7 text-zinc-600">
          Estamos confirmando sua compra. Em instantes você receberá um e-mail com o link pessoal para criar sua conta.
        </p>
        <p className="mt-3 text-sm text-zinc-500">
          Confira também as pastas de promoções e spam.
        </p>
        <Button asChild variant="outline" className="mt-8">
          <Link href="/auth/login">Já tenho uma conta</Link>
        </Button>
      </section>
    </main>
  )
}
