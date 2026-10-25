'use client'

import Script from 'next/script'

// Carregador do Pixel da Meta, parametrizado pelo id.
//
// Generaliza o MetaPixelListaEspera, que tinha o id da lista de espera fixo no
// componente. O funil do quiz usa um pixel proprio, e a pagina de sucesso
// precisa carregar o mesmo pixel do funil que gerou a venda — sem parametro,
// seria preciso um componente por pixel.

type Props = {
  pixelId: string | undefined
  /** PageView automatico. A pagina de sucesso quer Purchase, nao PageView. */
  comPageView?: boolean
  id?: string
}

export function MetaPixel({ pixelId, comPageView = true, id = 'meta-pixel' }: Props) {
  if (!pixelId) return null

  return (
    <>
      <Script id={id} strategy="afterInteractive">
        {`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${pixelId}');
          ${comPageView ? "fbq('track', 'PageView');" : ''}
        `}
      </Script>
      {comPageView && (
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: 'none' }}
            src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
            alt=""
          />
        </noscript>
      )}
    </>
  )
}
