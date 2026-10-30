-- Generaliza o checkout para novos provedores e preserva o historico Stripe.

ALTER TABLE public.compras
  ADD COLUMN IF NOT EXISTS payment_provider text,
  ADD COLUMN IF NOT EXISTS provider_checkout_id text,
  ADD COLUMN IF NOT EXISTS provider_payment_id text,
  ADD COLUMN IF NOT EXISTS provider_customer_id text,
  ADD COLUMN IF NOT EXISTS payment_method text,
  ADD COLUMN IF NOT EXISTS installments_count integer,
  ADD COLUMN IF NOT EXISTS receipt_url text,
  ADD COLUMN IF NOT EXISTS dev_mode boolean;

UPDATE public.compras
SET
  payment_provider = COALESCE(payment_provider, 'stripe'),
  provider_checkout_id = COALESCE(provider_checkout_id, stripe_checkout_session_id),
  provider_payment_id = COALESCE(provider_payment_id, stripe_payment_intent_id),
  provider_customer_id = COALESCE(provider_customer_id, stripe_customer_id)
WHERE payment_provider IS NULL OR provider_checkout_id IS NULL;

ALTER TABLE public.compras
  ALTER COLUMN payment_provider SET NOT NULL,
  ALTER COLUMN provider_checkout_id SET NOT NULL,
  ALTER COLUMN stripe_checkout_session_id DROP NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS compras_provider_checkout_idx
  ON public.compras (payment_provider, provider_checkout_id);

CREATE TABLE IF NOT EXISTS public.payment_webhook_events (
  provider text NOT NULL,
  event_id text NOT NULL,
  event_type text NOT NULL,
  processed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (provider, event_id)
);

INSERT INTO public.payment_webhook_events (
  provider,
  event_id,
  event_type,
  processed_at,
  created_at
)
SELECT
  'stripe',
  event_id,
  event_type,
  processed_at,
  created_at
FROM public.stripe_webhook_events
ON CONFLICT (provider, event_id) DO NOTHING;

ALTER TABLE public.payment_webhook_events ENABLE ROW LEVEL SECURITY;

