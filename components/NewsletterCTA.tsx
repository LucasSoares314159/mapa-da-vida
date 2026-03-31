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
      <div className="flex items-center gap-3 p-4 rounded-xl border border-[#c8d8d2] bg-white">
        <p className="text-sm text-[#6f8f87] flex-1">
          Continue evoluindo — receba toda semana.
        </p>
        <a
          href={linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-[#57AA8F] whitespace-nowrap hover:underline"
        >
          Assinar →
        </a>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-[#c8d8d2] bg-white p-6 space-y-4">
      <div className="space-y-1">
        <p className="text-xs font-medium uppercase tracking-widest text-[#a8c4bc]">
          MindTrail Newsletter
        </p>
        <h3
          className="text-lg font-semibold text-[#2A3F45]"
          style={{ fontFamily: "Space Grotesk" }}
        >
          Continue evoluindo depois do diagnóstico
        </h3>
        <p className="text-sm text-[#6f8f87]">
          Toda semana, um conteúdo para trabalhar as áreas do seu mapa na prática.
        </p>
      </div>

      {!iframeError ? (
        <div className="overflow-hidden rounded-xl">
          <iframe
            src={`${SUBSTACK_BASE}/embed`}
            width="100%"
            height="320"
            style={{ border: "none", background: "transparent" }}
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
          className="inline-block bg-[#57AA8F] text-white text-sm font-medium px-6 py-2.5 rounded-[10px] hover:opacity-90 transition-opacity"
        >
          Quero receber
        </a>
      )}

      <p className="text-xs text-center text-[#a8c4bc]">
        <a
          href={linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#57AA8F] hover:underline"
        >
          Inscreva-se na newsletter gratuita →
        </a>
      </p>
    </div>
  )
}
