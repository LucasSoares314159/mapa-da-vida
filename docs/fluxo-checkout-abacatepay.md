# Fluxo de Checkout AbacatePay e Liberacao de Acesso

## Visao geral

O pagamento e feito no Checkout hospedado da AbacatePay. A aplicacao somente
libera o acesso depois de receber e validar o webhook `checkout.completed`.

```mermaid
sequenceDiagram
    actor Cliente
    participant Site as MindTrail / Vercel
    participant Abacate as AbacatePay
    participant DB as Supabase
    participant Email as SMTP

    Cliente->>Site: POST /api/abacatepay/checkout
    Site->>Abacate: POST /v2/checkouts/create
    Note over Site,Abacate: PIX; CARD ate 12x somente quando habilitado
    Abacate-->>Site: data.url
    Site-->>Cliente: HTTP 303 para o Checkout
    Cliente->>Abacate: Informa os dados e paga
    Abacate-->>Cliente: Redireciona para /compra/sucesso
    Abacate->>Site: checkout.completed + secret + HMAC
    Site->>DB: Deduplica pelo ID do evento
    Site->>DB: Registra a compra confirmada
    Site->>DB: Cria token de acesso (somente hash)
    Site->>Email: Envia link /auth/cadastro?token=...
    Cliente->>Site: Cria a conta pelo convite
    Site->>DB: Vincula compra, usuario e perfil
```

## Criacao do checkout

`app/api/abacatepay/checkout/route.ts` cria um checkout com:

- produto configurado por `ABACATEPAY_PRODUCT_ID`;
- metodo `PIX` por padrao;
- `CARD` e `card.maxInstallments=12` quando `ABACATEPAY_CARD_ENABLED=true`;
- `returnUrl` apontando para `/trilha#comprar`;
- `completionUrl` apontando para `/compra/sucesso`;
- metadata `produto=trilha-produtividade`;
- identificador externo unico para rastreio.

O navegador recebe um redirecionamento `303` para a URL hospedada. Dados de
cartao nunca passam pela aplicacao.

## Confirmacao por webhook

`app/api/abacatepay/webhook/route.ts` recebe o evento. O endpoint cadastrado na
AbacatePay deve ser a URL HTTPS final, sem redirecionamentos:

```text
https://www.mindtrail.com.br/api/abacatepay/webhook
```

A AbacatePay acrescenta `?webhookSecret=...` automaticamente nas entregas. A
rota valida duas protecoes antes de ler o evento:

1. `webhookSecret` comparado com `ABACATEPAY_WEBHOOK_SECRET`.
2. `X-Webhook-Signature`, um HMAC-SHA256 do corpo bruto.

Depois disso, a rota aceita somente `checkout.completed`, confirma o status
`PAID` e verifica se o produto comprado corresponde a
`ABACATEPAY_PRODUCT_ID`.

## Idempotencia e retentativas

O ID do evento e registrado em `payment_webhook_events`, usando a chave
composta `(provider, event_id)`. Uma entrega repetida recebe HTTP 200 sem
reenviar o acesso.

Se o processamento falhar, o registro do evento e removido e a rota responde
5xx. Isso permite que as retentativas automaticas da AbacatePay processem o
evento novamente.

## Compra e convite

As compras usam os campos genericos:

- `payment_provider`;
- `provider_checkout_id`;
- `provider_payment_id`;
- `provider_customer_id`;
- `payment_method`;
- `installments_count`;
- `receipt_url`;
- `dev_mode`.

As colunas antigas `stripe_*` permanecem apenas para preservar o historico.

Depois de persistir a compra, `lib/acesso-compra.ts`:

1. Gera 32 bytes aleatorios.
2. Salva somente o hash SHA-256.
3. Envia o token puro no link por e-mail.
4. Invalida convites anteriores da mesma compra.
5. Expira o convite em sete dias por padrao.

## Variaveis de ambiente

```dotenv
ABACATEPAY_API_KEY=abc_dev_...
ABACATEPAY_PRODUCT_ID=prod_...
ABACATEPAY_WEBHOOK_SECRET=um-segredo-aleatorio-forte
ABACATEPAY_CARD_ENABLED=false
NEXT_PUBLIC_SITE_URL=http://localhost:3001
```

A mesma URL de API e usada em testes e producao. O ambiente e determinado pela
chave: `abc_dev_` simula pagamentos e `abc_prod_` processa pagamentos reais.
Produto e webhook devem ser criados separadamente em cada ambiente.

## Teste em Dev mode

1. Aplique as migrations do Supabase.
2. Configure as tres variaveis AbacatePay.
3. Cadastre o webhook para a URL HTTPS publica do ambiente.
4. Inicie uma compra pela pagina `/trilha`.
5. Conclua o pagamento com o metodo disponivel. Para testar cartao, confirme que
   a loja tem a modalidade liberada e use `ABACATEPAY_CARD_ENABLED=true`.
6. Confirme no banco a compra, o evento processado e o token de convite.
7. Abra o e-mail e conclua o cadastro.

## Producao

Antes do deploy real:

- conclua a aprovacao da conta AbacatePay com o CNPJ da empresa;
- crie o produto no ambiente de producao;
- gere uma chave `abc_prod_` com permissoes de checkout;
- crie um webhook de producao para `checkout.completed`;
- configure as variaveis no ambiente Production da Vercel;
- aplique a migration antes de receber o primeiro webhook;
- faca uma compra real de baixo valor e valide o fluxo completo.
