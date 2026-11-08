"use client"

import { useEffect } from "react"

export function FeedbackTally() {
  useEffect(() => {
    if (!document.getElementById("tally-script")) {
      const script = document.createElement("script")
      script.id = "tally-script"
      script.src = "https://tally.so/widgets/embed.js"
      script.async = true
      document.body.appendChild(script)
    } else {
      // @ts-expect-error Tally is loaded dynamically via script tag
      window.Tally?.loadEmbeds()
    }
  }, [])

  return (
    <div className="rounded-2xl border border-mt-border bg-white overflow-hidden">
      <iframe
        data-tally-src="https://tally.so/embed/ZjYody?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1"
        width="100%"
        height="284"
        frameBorder="0"
        marginHeight={0}
        marginWidth={0}
        title="Feedback Mapa da Vida" className="border-0 bg-transparent"
      />
    </div>
  )
}
