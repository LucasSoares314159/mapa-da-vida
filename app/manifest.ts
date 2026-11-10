import type { MetadataRoute } from 'next'

// App instalável da plataforma inteira (não só dos hábitos): o menu inferior leva
// a Trilha, Objetivos e Mapa, e num app só de hábitos esses toques abririam o
// navegador. Instalado, abre direto em /habitos — o gesto diário fica a um toque.
// Pelo navegador, o login continua levando a /content.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Trilha da Produtividade',
    short_name: 'Trilha',
    description: 'Seus hábitos, a Trilha e o Mapa da Vida num só lugar.',
    id: '/habitos',
    start_url: '/habitos',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    lang: 'pt-BR',
    background_color: '#EDF2EF',
    theme_color: '#ffffff',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }
}
