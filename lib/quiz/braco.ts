// Teste A/B 50/50 da Tela 01 (abertura) do quiz.
//
// Dois bracos, so de texto: 'a' = controle (copy no ar), 'b' = copy nova. O
// sorteio acontece no navegador, ANTES do primeiro paint, por um script inline
// no layout do /quiz: a pagina continua estatica (sem middleware, sem render no
// servidor) e nao ha flash nem redirect. O HTML ja traz as duas copies e o CSS
// esconde a do outro braco.
//
// O braco vai no cookie `mt_quiz_braco` (30 dias): a mesma pessoa ve sempre a
// mesma copy. Todo evento do quiz carrega `braco` (ver lib/tracking/eventos.ts)
// — nenhum evento novo.
//
// QA: ?qa=1&braco=a|b forca o braco SEM gravar cookie. So vale junto com qa=1
// (que ja desliga todo o rastreio), entao nao contamina o teste.

export type Braco = 'a' | 'b'

export const COOKIE_BRACO = 'mt_quiz_braco'
export const ATRIBUTO_BRACO = 'data-braco'
const SEGUNDOS_30_DIAS = 60 * 60 * 24 * 30

export function ehBraco(v: unknown): v is Braco {
  return v === 'a' || v === 'b'
}

/**
 * Decide o braco. Pura (aleatorio injetado) para testar.
 * Ordem: override de QA (qa=1) > cookie valido > sorteio novo.
 * `gravar` diz se o cookie precisa ser (re)gravado.
 */
export function resolverBraco(
  search: string,
  cookie: string | null | undefined,
  aleatorio: () => number
): { braco: Braco; gravar: boolean } {
  const q = new URLSearchParams(search)
  const forcado = q.get('braco')
  if (q.get('qa') === '1' && ehBraco(forcado)) return { braco: forcado, gravar: false }
  if (ehBraco(cookie)) return { braco: cookie, gravar: false }
  return { braco: aleatorio() < 0.5 ? 'a' : 'b', gravar: true }
}

/** Extrai o valor do cookie de uma string document.cookie. */
export function lerCookieBraco(documentCookie: string): string | null {
  const m = documentCookie.match(new RegExp(`(?:^|; )${COOKIE_BRACO}=([^;]*)`))
  return m ? m[1] : null
}

/**
 * Braco da sessao, para o track(). Le primeiro o atributo que o script de
 * sorteio pos no layout (vale mesmo com cookie bloqueado), depois o cookie.
 * Default 'a': evento sem braco nunca sai — o Gabe monitora ausencia de braco.
 */
export function bracoAtual(): Braco {
  if (typeof document === 'undefined') return 'a'
  try {
    const noDom = document.querySelector(`[${ATRIBUTO_BRACO}]`)?.getAttribute(ATRIBUTO_BRACO)
    if (ehBraco(noDom)) return noDom
    const doCookie = lerCookieBraco(document.cookie)
    if (ehBraco(doCookie)) return doCookie
  } catch {
    // cookie/DOM indisponivel: cai no default
  }
  return 'a'
}

/**
 * Script inline do layout. Espelha resolverBraco (qualquer mudanca aqui exige
 * mudar la, e o teste braco.test.ts executa este texto para garantir). Roda
 * dentro do div com o atributo, antes do conteudo: `currentScript.parentElement`
 * e o proprio wrapper. try/catch: se algo falhar, nenhum atributo e posto e a
 * pagina mostra o controle ('a').
 */
export const SCRIPT_SORTEIO_BRACO = `(function(){try{var s=location.search,q=new URLSearchParams(s),f=q.get('braco'),m=document.cookie.match(/(?:^|; )${COOKIE_BRACO}=([ab])(?:;|$)/),b;if(q.get('qa')==='1'&&(f==='a'||f==='b')){b=f}else if(m){b=m[1]}else{b=Math.random()<0.5?'a':'b';document.cookie='${COOKIE_BRACO}='+b+';path=/;max-age=${SEGUNDOS_30_DIAS};samesite=lax'}document.currentScript.parentElement.setAttribute('${ATRIBUTO_BRACO}',b)}catch(e){}})();`
