-- Purchase da Meta pela Conversions API.
--
-- checkout_atribuicao: sinais do navegador (cookies do Pixel, IP, user agent,
-- pagina de origem) gravados quando a cobranca e criada, sob o externalId que
-- nos geramos. O webhook do provedor nao tem nada disso; recupera daqui para o
-- Purchase casar com o anuncio. So o cliente admin le e escreve (RLS sem policy).
--
-- compras.external_id: liga a compra a sua atribuicao.
-- compras.meta_purchase_enviado_em: quando a Meta aceitou o Purchase. NULL =
-- nunca enviado. As vendas anteriores a esta migracao ficam NULL de proposito e
-- NAO sao reenviadas: o webhook so manda Purchase no processamento que libera o
-- acesso, e elas ja foram liberadas.

CREATE TABLE IF NOT EXISTS public.checkout_atribuicao (
  external_id text PRIMARY KEY,
  payment_provider text NOT NULL,
  source text,
  fbp text,
  fbc text,
  client_ip text,
  client_user_agent text,
  source_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.checkout_atribuicao ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.compras
  ADD COLUMN IF NOT EXISTS external_id text,
  ADD COLUMN IF NOT EXISTS meta_purchase_enviado_em timestamptz;
