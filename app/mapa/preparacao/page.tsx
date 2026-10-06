import { redirect } from 'next/navigation'

/**
 * A preparação virou a primeira fala do fluxo conversacional em /mapa/novo.
 *
 * A rota continua existindo porque é o destino de links já publicados — os dois
 * crons de e-mail, a Sidebar, o dashboard, a calculadora e a landing page. Um
 * redirect mantém tudo isso vivo sem duplicar a tela de "antes de começar".
 */
export default function PreparacaoPage() {
  redirect('/mapa/novo')
}
