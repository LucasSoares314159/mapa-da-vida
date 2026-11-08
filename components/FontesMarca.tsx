// Fontes da LP /trilha que o globals.css não carrega: Satoshi (títulos), que
// não está no Google Fonts e vem da Fontshare, e Lora 600, o negrito da prosa.
export function FontesMarca() {
  return (
    <>
      <link rel="preconnect" href="https://api.fontshare.com" crossOrigin="" />
      <link
        rel="stylesheet"
        href="https://api.fontshare.com/v2/css?f[]=satoshi@500,700&display=swap"
      />
      {/* A regra pressupõe o pages/_document; aqui a fonte é carregada por
          layout de propósito. */}
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Lora:wght@400;600&display=swap"
      />
    </>
  )
}
