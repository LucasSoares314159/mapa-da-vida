import { ListaEsperaForm } from '@/components/lista-espera/ListaEsperaForm'
import { MetaPixelListaEspera } from '@/components/MetaPixelListaEspera'
import { CheckCircle } from 'lucide-react'

export const metadata = {
  title: 'Lista de Espera — Trilha da Produtividade',
  description: 'Entre para a lista de espera da Trilha da Produtividade e seja avisado no lançamento.',
}

const INCLUSOS = [
  'Aulas gravadas com acesso vitalício',
  '3 encontros ao vivo em grupo durante o programa',
  'Acesso à plataforma MindTrail',
  'Guias exclusivos via newsletter',
  'Grupo de alunos alumni',
]

export default function ListaEsperaPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <MetaPixelListaEspera />
      {/* Hero */}
      <section className="bg-white border-b border-gray-200 py-12 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-emerald-600 mb-3">
            Em breve
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Trilha da Produtividade
          </h1>
          <p className="text-gray-600 text-lg mb-8">
            Um programa de 4 semanas para você construir seu próprio sistema de organização pessoal —
            do diagnóstico à rotina que funciona de verdade.
          </p>

          {/* Preço */}
          <div className="inline-block bg-emerald-50 border border-emerald-200 rounded-2xl px-8 py-5 mb-8">
            <p className="text-sm text-emerald-700 font-medium mb-1">Investimento</p>
            <p className="text-4xl font-bold text-emerald-700">R$ 499,00</p>
            <p className="text-sm text-emerald-600 mt-1">pagamento único</p>
          </div>

          {/* Incluso */}
          <div className="text-left max-w-sm mx-auto">
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              O que está incluso
            </p>
            <ul className="space-y-2">
              {INCLUSOS.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-gray-700 text-sm">
                  <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
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
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-1">Quero entrar na lista</h2>
            <p className="text-gray-500 text-sm mb-8">
              Preencha o formulário e avise você assim que as vagas abrirem.
            </p>
            <ListaEsperaForm />
          </div>
        </div>
      </section>
    </main>
  )
}
