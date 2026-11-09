// Service worker mínimo do app instalável.
//
// Existe para duas coisas: tornar a plataforma instalável e mostrar uma página
// amigável quando a pessoa abre o app sem internet. NÃO guarda nada em cache além
// da própria página offline: as telas são autenticadas e por pessoa, e servir
// uma versão guardada mostraria hábitos de ontem como se fossem de hoje.
const CACHE = 'trilha-offline-v1'
const OFFLINE = '/offline.html'

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.add(OFFLINE)))
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((chaves) => Promise.all(chaves.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
  )
  self.clients.claim()
})

// Só navegações (abrir uma página). Tudo o mais vai direto para a rede.
self.addEventListener('fetch', (event) => {
  if (event.request.mode !== 'navigate') return
  event.respondWith(fetch(event.request).catch(() => caches.match(OFFLINE)))
})
