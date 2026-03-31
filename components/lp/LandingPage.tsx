import Link from "next/link"

export function LandingPage() {
  return (
    <div className="w-full bg-mt-off-white font-sans text-mt-green-dark">

      {/* Nav */}
      <nav className="sticky top-0 z-50 flex items-center justify-between bg-white px-8 py-4 border-b border-mt-border">
        <Link href="/" className="text-[15px] font-semibold text-mt-green-dark no-underline">
          Mapa da Vida
        </Link>
        <div className="flex items-center gap-6">
          <Link
            href="https://themindtrail.substack.com/subscribe?utm_source=mapa-da-vida&utm_medium=header&utm_campaign=header-fixo"
            target="_blank" rel="noopener noreferrer"
            className="hidden sm:block text-[13px] text-mt-muted hover:text-mt-green-dark transition-colors no-underline"
          >
            Newsletter
          </Link>
      
          <Link
            href="/auth/login"
            className="text-[13px] text-mt-muted hover:text-mt-green-dark transition-colors no-underline"
          >
            Entrar
          </Link>
          <Link
            href="/mapa/preparacao"
            className="text-[13px] font-medium bg-mt-green text-white px-4 py-[7px] rounded-lg hover:opacity-90 transition-opacity no-underline"
          >
            Criar meu mapa
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-white border-b border-mt-border px-8 py-20 text-center">
        <span className="inline-block text-[11px] font-semibold tracking-[0.09em] uppercase text-mt-green bg-[#E8F5F1] px-[14px] py-[5px] rounded-badge mb-6">
          Diagnóstico gratuito
        </span>
        <h1 className="font-heading text-[clamp(28px,4vw,42px)] font-semibold leading-[1.15] text-mt-green-dark max-w-[580px] mx-auto mb-5">
          Você sabe, de verdade, como estão as áreas da sua vida?
        </h1>
        <p className="text-[17px] leading-[1.65] text-mt-muted max-w-[460px] mx-auto mb-9">
          Responda 9 perguntas honestas e receba um diagnóstico personalizado sobre o que está sustentando — e o que está consumindo — a sua energia.
        </p>
        <Link
          href="/mapa/preparacao"
          className="inline-block bg-mt-green text-white text-[15px] font-medium px-[30px] py-[13px] rounded-[10px] hover:opacity-90 transition-opacity no-underline"
        >
          Criar meu mapa gratuitamente
        </Link>
        <span className="block mt-3 text-[12px] text-[#a8c4bc]">
          Dez minutos de foco. Um mapa para começar a mudança.
        </span>
      </section>

      {/* Bloco escuro — impacto */}
      <div className="bg-mt-green-dark px-8 py-12">
        <div className="max-w-[760px] mx-auto">
          <p className="text-[11px] font-semibold tracking-[0.09em] uppercase text-mt-muted mb-3">
            Por que isso importa
          </p>
          <p className="font-editorial text-[19px] italic leading-[1.65] text-mt-off-white">
            &ldquo;A maioria das pessoas tenta resolver o caos da vida sem antes analisar as causas. O Mapa da Vida te guia nessa análise e te entrega um diagnóstico que você não vai conseguir ignorar.&rdquo;
          </p>
        </div>
      </div>

      {/* Como funciona */}
      <section className="bg-mt-off-white px-8 py-16">
        <div className="max-w-[760px] mx-auto">
          <p className="text-[11px] font-semibold tracking-[0.09em] uppercase text-[#a8c4bc] mb-3">
            Como funciona
          </p>
          <h2 className="font-heading text-2xl font-semibold text-mt-green-dark mb-2">
            Três passos. Um choque de realidade.
          </h2>
          <p className="text-[15px] text-mt-muted leading-[1.65] mb-8">
            O processo é simples. A clareza que ele gera, não.
          </p>
          <div className="flex flex-col gap-3">
            {[
              {
                num: "1",
                titulo: "Responda as perguntas",
                desc: "9 perguntas reflexivas sobre os três pilares da sua vida: Corpo, Mente e Espírito. Sem respostas certas ou erradas.",
              },
              {
                num: "2",
                titulo: "Veja seu mapa",
                desc: "Cada área classificada em verde, amarelo ou vermelho — visualizada em um fluxograma que mostra o estado real do seu equilíbrio.",
              },
              {
                num: "3",
                titulo: "Receba seu diagnóstico",
                desc: "Uma análise personalizada baseada no padrão das suas respostas — não um texto genérico, mas uma leitura do seu momento específico.",
              },
            ].map((passo) => (
              <div key={passo.num} className="flex gap-4 items-start bg-white border border-mt-border rounded-xl px-5 py-[18px]">
                <div className="w-[30px] h-[30px] min-w-[30px] rounded-full bg-[#E8F5F1] flex items-center justify-center text-[13px] font-semibold text-mt-green">
                  {passo.num}
                </div>
                <div>
                  <p className="text-[14px] font-semibold text-mt-green-dark mb-1">{passo.titulo}</p>
                  <p className="text-[13px] text-mt-muted leading-[1.55]">{passo.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="h-px bg-mt-border" />

      {/* Os pilares */}
      <section className="bg-white px-8 py-16">
        <div className="max-w-[760px] mx-auto">
          <p className="text-[11px] font-semibold tracking-[0.09em] uppercase text-[#a8c4bc] mb-3">
            Os pilares
          </p>
          <h2 className="font-heading text-2xl font-semibold text-mt-green-dark mb-2">
            Corpo, Mente e Espírito
          </h2>
          <p className="text-[15px] text-mt-muted leading-[1.65] mb-8">
            Nove áreas. Três pilares. A estrutura que sustenta — ou que fragmenta — uma vida equilibrada.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { nome: "Corpo",   areas: ["Exercícios físicos", "Alimentação", "Hobbies"] },
              { nome: "Mente",   areas: ["Rede de apoio", "Trabalho", "Finanças"] },
              { nome: "Espírito", areas: ["Propósito", "Experiências", "Espiritualidade"] },
            ].map((pilar) => (
              <div key={pilar.nome} className="bg-white border border-mt-border rounded-xl p-5">
                <p className="text-[13px] font-semibold text-mt-green-dark mb-[10px]">{pilar.nome}</p>
                <div className="flex flex-col gap-[5px]">
                  {pilar.areas.map((area) => (
                    <span key={area} className="text-[11px] text-mt-muted bg-mt-off-white rounded-md px-[9px] py-1 inline-block">
                      {area}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="h-px bg-mt-border" />

      {/* Exemplo de diagnóstico */}
      <section className="bg-mt-off-white px-8 py-16">
        <div className="max-w-[760px] mx-auto">
          <p className="text-[11px] font-semibold tracking-[0.09em] uppercase text-[#a8c4bc] mb-3">
            Exemplo de diagnóstico
          </p>
          <h2 className="font-heading text-2xl font-semibold text-mt-green-dark mb-2">
            O que você vai receber
          </h2>
          <p className="text-[15px] text-mt-muted leading-[1.65] mb-8">
            Não um relatório genérico. Uma leitura do seu padrão específico de respostas.
          </p>
          <div className="bg-white border border-mt-border rounded-card p-8">
            <p className="text-[11px] font-semibold tracking-[0.08em] uppercase text-[#a8c4bc] mb-4">
              Diagnóstico · Estrutura frágil
            </p>
            <div className="flex gap-2 flex-wrap mb-5">
              <span className="inline-flex items-center gap-[5px] text-[12px] font-semibold bg-[#E8F5F1] text-[#2A8F6F] px-[11px] py-1 rounded-badge">
                <span className="w-[7px] h-[7px] rounded-full bg-mt-green inline-block" />
                5 verdes
              </span>
              <span className="inline-flex items-center gap-[5px] text-[12px] font-semibold bg-[#FBF5E6] text-[#A07820] px-[11px] py-1 rounded-badge">
                <span className="w-[7px] h-[7px] rounded-full bg-mt-yellow inline-block" />
                2 amarelos
              </span>
              <span className="inline-flex items-center gap-[5px] text-[12px] font-semibold bg-[#FAECEC] text-[#903030] px-[11px] py-1 rounded-badge">
                <span className="w-[7px] h-[7px] rounded-full bg-mt-red inline-block" />
                2 vermelhos
              </span>
            </div>
            <p className="font-editorial text-[15px] italic leading-[1.7] text-mt-muted border-l-2 border-mt-green pl-4 mb-4">
              A estrutura que deveria te sustentar está frágil. Trabalho pesando, relações superficiais, dinheiro sem controle — cada um desses sozinho é administrável. Os três juntos criam um ciclo que consome mais energia do que você percebe.
            </p>
            <p className="text-[12px] text-[#a8c4bc]">
              Diagnóstico personalizado, baseados nas suas respostas reais.
            </p>
          </div>
        </div>
      </section>

      <div className="h-px bg-mt-border" />

      {/* FAQ */}
      <section className="bg-white px-8 py-16">
        <div className="max-w-[760px] mx-auto">
          <p className="text-[11px] font-semibold tracking-[0.09em] uppercase text-[#a8c4bc] mb-3">
            Perguntas frequentes
          </p>
          <h2 className="font-heading text-2xl font-semibold text-mt-green-dark mb-6">
            Antes de começar
          </h2>
          <div>
            {[
              {
                q: "É realmente gratuito?",
                a: "Sim. Criar seu mapa e receber o diagnóstico é 100% gratuito, sem cartão de crédito.",
              },
              {
                q: "Quanto tempo leva?",
                a: "Menos de 10 minutos. São 9 perguntas reflexivas — sem respostas certas ou erradas, só honestidade.",
              },
              {
                q: "De onde vem a metodologia?",
                a: "O Mapa da Vida é o diagnóstico da Trilha da Produtividade — um programa criado por Lucas Soares com base nos pilares das Zonas Azuis: o estudo que mapeou os hábitos das pessoas mais longevas do mundo.",
              },
              {
                q: "O que acontece depois do diagnóstico?",
                a: "Você fica com o mapa salvo para acompanhar sua evolução. Se quiser ir além, pode entrar na newsletter semanal da MindTrail ou conhecer a Trilha da Produtividade — o programa completo de 4 semanas.",
              },
            ].map((item, i) => (
              <div
                key={item.q}
                className={`py-[18px] ${i === 0 ? "border-t border-mt-border" : ""} border-b border-mt-border`}
              >
                <p className="text-[14px] font-semibold text-mt-green-dark mb-[6px]">{item.q}</p>
                <p className="text-[13px] text-mt-muted leading-[1.65]">{item.a}</p>
              </div>
            ))}
          </div>

          {/* Newsletter */}
          <div className="mt-12 bg-white border-2 border-mt-green rounded-card p-8 flex flex-col sm:flex-row gap-8 items-center">
            <div className="flex-1">
              <p className="text-[11px] font-semibold tracking-[0.09em] uppercase text-[#a8c4bc] mb-2">
                MindTrail Newsletter
              </p>
              <p className="font-heading text-[18px] font-semibold text-mt-green-dark leading-[1.3] mb-[6px]">
                Continue evoluindo depois do diagnóstico
              </p>
              <p className="text-[13px] text-mt-muted leading-[1.6]">
                Toda semana, um conteúdo para trabalhar as áreas do seu mapa na prática. Gratuito, direto ao ponto.
              </p>
            </div>
            <div className="flex flex-col items-center gap-2 w-full sm:min-w-[190px] sm:w-auto">
              <Link
                href="https://themindtrail.substack.com/subscribe?utm_source=mapa-da-vida&utm_medium=lp&utm_campaign=lp-newsletter"
                target="_blank" rel="noopener noreferrer"
                className="block w-full text-center bg-mt-green text-white text-[14px] font-medium px-[22px] py-[11px] rounded-[10px] hover:opacity-90 transition-opacity no-underline"
              >
                Assinar gratuitamente
              </Link>
              <span className="text-[11px] text-[#a8c4bc] text-center">Sem spam. Cancele quando quiser.</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="bg-mt-off-white px-8 py-16">
        <div className="max-w-[760px] mx-auto">
          <div className="bg-mt-green-dark rounded-card px-8 py-12 text-center">
            <h2 className="font-heading text-[26px] font-semibold text-mt-off-white mb-3">
              Pronto para ver o seu mapa?
            </h2>
            <p className="text-[15px] text-[#a8c4bc] leading-[1.6] mb-7">
              Leva menos de 10 minutos.<br />
              O diagnóstico fica disponível para você relembrar quando quiser.
            </p>
            <Link
              href="/mapa/preparacao"
              className="inline-block bg-mt-green text-white text-[15px] font-medium px-8 py-[14px] rounded-[10px] hover:opacity-90 transition-opacity no-underline"
            >
              Criar meu mapa gratuitamente
            </Link>
            <p className="text-[12px] text-mt-muted mt-3">Gratuito. Agora, e para sempre.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-mt-border px-8 py-8 flex flex-col sm:flex-row justify-between items-center gap-4">
        <span className="text-[12px] text-[#a8c4bc]">© Mapa da Vida · MindTrail 2025</span>
        <div className="flex gap-5">
          <Link
            href="https://themindtrail.substack.com"
            target="_blank" rel="noopener noreferrer"
            className="text-[12px] text-mt-muted hover:text-mt-green-dark transition-colors no-underline"
          >
            Newsletter
          </Link>
          <Link
            href="https://chat.whatsapp.com/EbTqMObFEzoCKmHRC5ruoP"
            target="_blank" rel="noopener noreferrer"
            className="text-[12px] text-mt-muted hover:text-mt-green-dark transition-colors no-underline"
          >
            Comunidade
          </Link>
        </div>
      </footer>

    </div>
  )
}
