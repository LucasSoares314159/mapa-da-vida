import Link from 'next/link'
import { EMPRESA, LEGAL_ATUALIZADO_EM } from '@/lib/empresa'

// Moldura compartilhada por /termos-uso e /cancelamento: mesma tipografia,
// mesmo rodapé com identificação da empresa e links cruzados.
export function PaginaLegal({
  titulo,
  children,
}: {
  titulo: string
  children: React.ReactNode
}) {
  return (
    <main className="flex-1 bg-mt-off-white px-4 py-12 sm:py-16">
      <article className="mx-auto w-full max-w-[720px] rounded-2xl border border-mt-border bg-mt-surface px-6 py-10 sm:px-12">
        <Link
          href="/trilha"
          className="font-heading text-base font-medium text-mt-green-dark no-underline"
        >
          Mind<span className="text-mt-green">Trail</span>
        </Link>

        <h1 className="mt-8 font-heading text-3xl font-medium text-mt-green-dark">{titulo}</h1>
        <p className="mt-2 text-sm text-mt-muted">Última atualização: {LEGAL_ATUALIZADO_EM}</p>

        <div className="mt-8 space-y-8 text-[15px] leading-7 text-zinc-700">{children}</div>

        <footer className="mt-12 border-t border-mt-border pt-6 text-sm leading-6 text-mt-muted">
          <p>
            {EMPRESA.razaoSocial} · CNPJ {EMPRESA.cnpj}
            <br />
            {EMPRESA.endereco}
          </p>
          <nav className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
            <Link href="/termos-uso" className="text-mt-green hover:underline">
              Termos de Uso
            </Link>
            <Link href="/cancelamento" className="text-mt-green hover:underline">
              Cancelamento e Reembolso
            </Link>
            <Link href="/trilha" className="text-mt-green hover:underline">
              Voltar para a Trilha
            </Link>
          </nav>
        </footer>
      </article>
    </main>
  )
}

export function Secao({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="font-heading text-lg font-medium text-mt-green-dark">{titulo}</h2>
      {children}
    </section>
  )
}

export function Lista({ children }: { children: React.ReactNode }) {
  return <ul className="list-disc space-y-2 pl-5">{children}</ul>
}

export function LinkWhatsApp() {
  return (
    <a
      href={EMPRESA.whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="text-mt-green underline"
    >
      WhatsApp {EMPRESA.whatsapp}
    </a>
  )
}
