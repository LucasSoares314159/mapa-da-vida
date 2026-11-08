"use client"

import { useState } from "react"

interface NewsletterCTAProps {
  utm_campaign: "pos-mapa" | "pos-diagnostico" | "dashboard"
  variant?: "full" | "compact"
}

const SUBSTACK_BASE = "https://themindtrail.substack.com"

export function NewsletterCTA({ utm_campaign, variant = "full" }: NewsletterCTAProps) {
  const [iframeError, setIframeError] = useState(false)

  const linkUrl = `${SUBSTACK_BASE}/subscribe?utm_source=mapa-da-vida&utm_medium=cta&utm_campaign=${utm_campaign}`

  if (variant === "compact") {
    return (
      <div className="card-mt flex items-center gap-3 p-4">
        <p className="text-sm text-mt-apoio flex-1">
          📩 Textos semanais sobre produtividade e sistemas pessoais.
        </p>
        <a
          href={linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="whitespace-nowrap text-sm font-medium text-mt-green-dark underline decoration-mt-green underline-offset-4 hover:decoration-2"
        >
          Newsletter MindTrail →
        </a>
      </div>
    )
  }

  return (
    <div className="card-mt space-y-4 p-card">
      <div className="space-y-1">
        <p className="rotulo">
          MindTrail Newsletter
        </p>
        <h3 className="font-heading text-subtitulo font-medium text-mt-green-dark">
          Continue evoluindo depois do diagnóstico
        </h3>
        <p className="text-sm text-mt-apoio">
          Toda semana, um conteúdo para trabalhar as áreas do seu mapa na prática.
        </p>
      </div>

      {!iframeError ? (
        <div className="overflow-hidden rounded-elemento">
          <iframe
            src={`${SUBSTACK_BASE}/embed`}
            width="100%"
            height="320" className="border-0 bg-transparent"
            frameBorder="0"
            scrolling="no"
            onError={() => setIframeError(true)}
          />
        </div>
      ) : (
        <a
          href={linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center rounded-full bg-mt-green px-6 py-3 text-base font-medium text-white transition-opacity hover:opacity-90"
        >
          Quero receber
        </a>
      )}

      <p className="text-center text-sm">
        <a
          href={linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-mt-green-dark underline decoration-mt-green underline-offset-4 hover:decoration-2"
        >
          Inscreva-se na newsletter gratuita →
        </a>
      </p>
    </div>
  )
}
