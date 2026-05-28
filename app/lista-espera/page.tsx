import { Suspense } from 'react'
import { ListaEsperaForm } from '@/components/lista-espera/ListaEsperaForm'
import { MetaPixelListaEspera } from '@/components/MetaPixelListaEspera'
import { CheckCircle } from 'lucide-react'

export const metadata = {
  title: 'Lista de Espera — Trilha da Produtividade',
  description: 'Entre para a lista de espera da Trilha da Produtividade e seja avisado no lançamento.',
}

const INCLUSOS = [
  'Aulas gravadas',
  '3 encontros ao vivo em grupo durante o programa',
  'Acesso à plataforma MindTrail',
  'Guias exclusivos via newsletter',
  'Grupo de alunos alumni',
]

export default function ListaEsperaPage() {
  return (
    <main className="min-h-screen bg-mt-off-white">
      <MetaPixelListaEspera />
      {/* Hero */}
      <section className="bg-white border-b border-mt-border py-12 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-mt-green mb-3">
            Em breve
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-mt-black mb-4">
            Trilha da Produtividade
          </h1>
          <p className="text-mt-muted text-lg mb-8">
            Um programa de 4 semanas para você construir seu próprio sistema de organização pessoal —
            do diagnóstico à rotina que funciona de verdade.
          </p>

          {/* Preço */}
          <div className="inline-block bg-mt-green-dark rounded-2xl px-8 py-5 mb-8">
            <p className="text-sm text-mt-border font-medium mb-1">Investimento</p>
            <p className="text-5xl font-bold text-white">R$ 499,99</p>
            <p className="text-sm text-mt-border mt-1">em até 12x</p>
          </div>

          {/* Incluso */}
          <div className="text-left max-w-sm mx-auto">
            <p className="text-sm font-semibold text-mt-muted uppercase tracking-wide mb-3">
              O que está incluso
            </p>
            <ul className="space-y-2">
              {INCLUSOS.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-mt-black text-sm">
                  <CheckCircle className="w-4 h-4 text-mt-green flex-shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Formulário */}
      <section className="py-12 px-6">
        <div className="max-w-xl mx-auto">
          <div className="bg-white rounded-2xl border border-mt-border shadow-sm p-8">
            <h2 className="text-xl font-bold text-mt-black mb-1">Quero entrar na lista</h2>
            <p className="text-mt-muted text-sm mb-8">
              Preencha o formulário e avisamos você assim que as vagas abrirem.
            </p>
            <Suspense>
              <ListaEsperaForm />
            </Suspense>
          </div>
        </div>
      </section>
    </main>
  )
}
