# Checkout Stripe em ambiente local

Este fluxo usa apenas o modo de teste do Stripe. Nunca use cartao real nem uma chave `sk_live_` durante o desenvolvimento.

## 1. Preparar o Supabase local

O projeto ja inclui a CLI e o arquivo `supabase/config.toml`.

```powershell
npx supabase start
npx supabase status
```

Copie a URL, a chave publica e a chave secreta mostradas por `supabase status` para `.env`, seguindo `.env.example`.

Este repositorio ainda precisa receber o esquema-base do Supabase hospedado antes de uma recriacao local completa. Com acesso ao projeto remoto:

```powershell
npx supabase login
npx supabase link --project-ref SEU_PROJECT_REF
npx supabase db pull
```

Ao iniciar ou resetar a stack, a CLI aplica automaticamente `supabase/migrations/20260928233000_checkout_stripe.sql`.

O Mailpit local recebe os e-mails da aplicacao. A interface fica em `http://127.0.0.1:54324` e o SMTP em `127.0.0.1:54325`.

Sem SMTP configurado, `npm run dev` imprime o link de cadastro no terminal com o prefixo
`[checkout-dev]`. Esse fallback nunca e usado em producao.

## 2. Preparar o Stripe Sandbox

No Stripe em modo de teste, crie um produto de pagamento unico de R$ 497 e coloque o identificador `price_...` em `STRIPE_PRICE_ID`. Coloque a chave secreta de teste `sk_test_...` em `STRIPE_SECRET_KEY`.

Autentique a Stripe CLI e encaminhe somente os eventos usados pela aplicacao:

```powershell
stripe login
stripe listen --events checkout.session.completed,checkout.session.async_payment_succeeded --forward-to localhost:3001/api/stripe/webhook
```

O comando imprime um segredo `whsec_...`. Use esse valor em `STRIPE_WEBHOOK_SECRET` e reinicie o servidor Next.js.

## 3. Executar o teste ponta a ponta

```powershell
npm run dev
```

1. Abra `http://localhost:3001/trilha` e clique em **Entrar na Trilha**.
2. No Checkout de teste, use `4242 4242 4242 4242`, qualquer data futura e qualquer CVC de tres digitos.
3. Confirme que o Stripe CLI recebeu o evento e obteve HTTP 200.
4. Abra `http://127.0.0.1:54324` e acesse o e-mail capturado pelo Mailpit.
5. Abra o link de cadastro, preencha nome, telefone e senha e confirme a entrada em `/content`.
6. Abra o mesmo link novamente e confirme que ele nao pode mais ser usado.

## Reenvio de link

Com um administrador autenticado no navegador, envie um POST para `/api/admin/compras/reenviar-acesso` com JSON no formato:

```json
{ "email": "cliente@example.com" }
```

O endpoint invalida links anteriores ainda ativos e envia um novo.
