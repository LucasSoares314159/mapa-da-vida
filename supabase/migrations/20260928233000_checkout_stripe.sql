-- Checkout Stripe: compras confirmadas, idempotencia de webhooks e links de acesso.

CREATE TABLE IF NOT EXISTS public.compras (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_checkout_session_id text NOT NULL UNIQUE,
  stripe_payment_intent_id text,
  stripe_customer_id text,
  produto text NOT NULL DEFAULT 'trilha-produtividade',
  email text NOT NULL,
  nome_cliente text,
  amount_total bigint,
  currency text,
  status text NOT NULL DEFAULT 'pago'
    CHECK (status IN ('pago', 'link_enviado', 'conta_criada')),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  paid_at timestamptz NOT NULL DEFAULT now(),
  access_email_sent_at timestamptz,
  account_created_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS compras_email_idx ON public.compras (email);
CREATE INDEX IF NOT EXISTS compras_user_id_idx ON public.compras (user_id);

ALTER TABLE public.compras ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.tokens_acesso_compra (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  compra_id uuid NOT NULL REFERENCES public.compras(id) ON DELETE CASCADE,
  token_hash text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  invalidated_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS tokens_acesso_compra_compra_id_idx
  ON public.tokens_acesso_compra (compra_id);

ALTER TABLE public.tokens_acesso_compra ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.stripe_webhook_events (
  event_id text PRIMARY KEY,
  event_type text NOT NULL,
  processed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.stripe_webhook_events ENABLE ROW LEVEL SECURITY;
