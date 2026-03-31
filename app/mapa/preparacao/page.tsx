import Link from 'next/link'
import { ArrowLeft, ArrowRight } from 'lucide-react'

// Indicador de etapas do fluxo AHA moment
function IndicadorEtapas() {
  const etapas = ['Consciência', 'Mapa', 'Análise']

  return (
    <div className="flex items-center gap-0">
      {etapas.map((label, i) => {
        const ativa = i === 0
        return (
          <div key={label} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className="flex size-7 items-center justify-center rounded-full text-xs font-semibold"
                style={
                  ativa
                    ? { backgroundColor: '#57AA8F', color: '#fff' }
                    : { border: '1px solid #3d5a62', backgroundColor: 'transparent', color: '#6f8f87' }
                }
              >
                {i + 1}
              </div>
              <span
                className="text-[11px] font-medium whitespace-nowrap"
                style={{ color: ativa ? '#57AA8F' : '#6f8f87', fontWeight: ativa ? 500 : 400 }}
              >
                {label}
              </span>
            </div>

            {/* Linha conectora entre etapas */}
            {i < etapas.length - 1 && (
              <div
                className="mb-4 mx-3 h-px"
                style={{ width: 24, backgroundColor: '#3d5a62' }}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

export default function PreparacaoPage() {
  return (
    <main
      className="relative flex min-h-screen flex-col items-center justify-center px-6 py-16"
      style={{ backgroundColor: '#2A3F45' }}
    >
      <Link
        href="/dashboard"
        className="absolute left-6 top-6 flex items-center gap-1.5 text-sm transition-colors duration-200"
        style={{ color: '#6f8f87' }}
      >
        <ArrowLeft className="size-4" />
        Voltar
      </Link>

      <div className="w-full max-w-sm">
        {/* Indicador de etapas */}
        <div className="mb-10">
          <IndicadorEtapas />
        </div>

        {/* Label */}
        <p
          className="mb-5 uppercase"
          style={{
            color: '#EDF2EF',
            fontSize: 11,
            fontWeight: 500,
            letterSpacing: '1.2px',
          }}
        >
          Antes de começar
        </p>

        {/* Título */}
        <h1
          className="mb-10 leading-[1.15]"
          style={{
            fontFamily: 'var(--font-space-grotesk), Space Grotesk, sans-serif',
            fontSize: 42,
            fontWeight: 500,
            color: '#57AA8F',
          }}
        >
          Esse não é um quiz.
          <br />
          É uma pausa.
        </h1>

        {/* Parágrafos */}
        <div className="flex flex-col gap-6">
          <p style={{ color: '#EDF2EF', fontSize: 17, lineHeight: 1.75 }}>
            Você vai responder 9 perguntas sobre pilares da sua vida — uma de cada vez, com honestidade.
            Não existe resposta certa.
          </p>
          <p style={{ color: '#EDF2EF', fontSize: 17, lineHeight: 1.75, fontWeight: 800 }}>
            Reserve 10 minutos. Feche outras abas. Responda pelo que é verdade hoje, não pelo que
            você quer que seja.
          </p>

          {/* Parágrafo de destaque em Lora itálico */}
          <p
            style={{
              fontFamily: 'var(--font-lora), Lora, serif',
              fontStyle: 'italic',
              fontSize: 16,
              color: '#a8c4bc',
              borderLeft: '2px solid #57AA8F',
              paddingLeft: 16,
              lineHeight: 1.75,
            }}
          >
            A maioria das pessoas nunca para para olhar para a própria vida dessa forma. Você está
            prestes a fazer isso.
          </p>
        </div>

        {/* Botão Estou pronto */}
        <Link
          href="/mapa/novo"
          className="mt-12 flex w-full items-center justify-center gap-2 text-white transition-opacity hover:opacity-90"
          style={{
            backgroundColor: '#57AA8F',
            borderRadius: 10,
            padding: '18px 24px',
            fontSize: 16,
            fontWeight: 500,
            textDecoration: 'none',
          }}
        >
          Estou pronto(a)
          <ArrowRight className="size-4" />
        </Link>
      </div>
    </main>
  )
}
