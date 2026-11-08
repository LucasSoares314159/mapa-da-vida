#!/usr/bin/env node
/*
 * Simula o webhook checkout.completed da AbacatePay contra um servidor local,
 * assinado exatamente como a AbacatePay assina (HMAC-SHA256 base64 do corpo).
 *
 * Uso (com o `npm run dev` rodando):
 *   node --env-file=.env.local scripts/simular-webhook-abacatepay.mjs --email voce@exemplo.com
 *
 * Opcoes:
 *   --email <e-mail>       obrigatorio; recebe o link de cadastro se o SMTP estiver configurado
 *   --external-id <id>     externalId de um checkout criado localmente, para testar a
 *                          atribuicao gravada em checkout_atribuicao (padrao: id novo)
 *   --base <url>           servidor alvo (padrao: http://localhost:3001)
 *   --cartao               simula 12x com a taxa repassada ao cliente (value deve sair 297)
 *   --repetir              reenvia o mesmo evento: o segundo deve voltar duplicate e
 *                          a Meta deve receber um Purchase so
 *
 * Efeitos reais: grava a compra (dev_mode = true) no Supabase do .env.local e
 * dispara o e-mail de acesso. Para nao contar como venda na Meta, exige
 * META_CAPI_TEST_CODE sempre que META_CAPI_ACCESS_TOKEN estiver definido.
 */
import { createHmac, randomUUID } from 'node:crypto'
import { readFileSync } from 'node:fs'

function argumento(nome) {
  const i = process.argv.indexOf(`--${nome}`)
  return i === -1 ? undefined : process.argv[i + 1]
}
const tem = (nome) => process.argv.includes(`--${nome}`)
function sair(mensagem) {
  console.error(`\n✖ ${mensagem}\n`)
  process.exit(1)
}

const email = argumento('email')
const base = (argumento('base') ?? 'http://localhost:3001').replace(/\/$/, '')
const externalId = argumento('external-id') ?? `trilha-produtividade-sim-${randomUUID()}`
const segredo = process.env.ABACATEPAY_WEBHOOK_SECRET
const produto = process.env.ABACATEPAY_PRODUCT_ID

if (!email) sair('Informe --email.')
if (!segredo || !produto) {
  sair('ABACATEPAY_WEBHOOK_SECRET e ABACATEPAY_PRODUCT_ID precisam estar no .env.local (os mesmos do servidor).')
}
if (process.env.META_CAPI_ACCESS_TOKEN?.trim() && !process.env.META_CAPI_TEST_CODE?.trim()) {
  sair(
    'META_CAPI_ACCESS_TOKEN definido sem META_CAPI_TEST_CODE: o Purchase simulado contaria como venda real.\n' +
      '  Copie o codigo em Gerenciador de Eventos → Eventos de teste e defina META_CAPI_TEST_CODE.'
  )
}

// Chave lida da fonte unica, para o simulador nunca assinar com outra.
const fonte = readFileSync(new URL('../lib/abacatepay.ts', import.meta.url), 'utf8')
const chave = fonte.match(/ABACATEPAY_PUBLIC_KEY =\s*'([^']+)'/)?.[1]
if (!chave) sair('Nao encontrei ABACATEPAY_PUBLIC_KEY em lib/abacatepay.ts.')

const cartao = tem('cartao')
const corpo = JSON.stringify({
  id: `log_sim_${randomUUID()}`,
  event: 'checkout.completed',
  apiVersion: 2,
  devMode: true,
  data: {
    checkout: {
      id: `bill_sim_${randomUUID()}`,
      externalId,
      status: 'PAID',
      amount: cartao ? 35208 : 29700,
      paidAmount: cartao ? 35208 : 29700,
      customerFee: cartao ? 5508 : null,
      customerId: 'cust_sim',
      installmentsCount: cartao ? 12 : null,
      receiptUrl: null,
      updatedAt: new Date().toISOString(),
      items: [{ id: produto, quantity: 1 }],
      metadata: {},
    },
    customer: { id: 'cust_sim', name: 'Pessoa Teste Simulada', email, taxId: '123.***.***-**' },
    payerInformation: { method: cartao ? 'CARD' : 'PIX' },
  },
})
const assinatura = createHmac('sha256', chave).update(Buffer.from(corpo, 'utf8')).digest('base64')

async function enviar(rotulo) {
  const inicio = Date.now()
  const resposta = await fetch(
    `${base}/api/abacatepay/webhook?webhookSecret=${encodeURIComponent(segredo)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Webhook-Signature': assinatura },
      body: corpo,
    }
  )
  console.log(`${rotulo}: HTTP ${resposta.status} em ${Date.now() - inicio}ms →`, await resposta.text())
}

console.log(`externalId:  ${externalId}`)
console.log(`event_id:    purchase_${externalId}   (procure este id no Gerenciador de Eventos)`)
console.log(`pagina sucesso: ${base}/compra/sucesso?checkout_ref=${encodeURIComponent(externalId)}\n`)

await enviar('1º envio')
if (tem('repetir')) await enviar('2º envio (mesmo evento)')

console.log('\nNo terminal do servidor nao deve haver "[capi]" nem "[abacatepay-webhook]" com erro.')
