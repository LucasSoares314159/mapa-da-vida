import type { Metadata } from 'next'
import Link from 'next/link'
import { PaginaLegal, Secao, Lista, LinkWhatsApp } from '@/components/legal/PaginaLegal'
import { EMPRESA, PROCESSADOR_PAGAMENTO, TRILHA_PARCELAS_MAX, TRILHA_PRECO } from '@/lib/empresa'

export const metadata: Metadata = {
  title: 'Política de Cancelamento e Reembolso',
  description:
    'Direito de arrependimento de 7 dias, como pedir o reembolso e como funciona o estorno de compras parceladas da TRILHA.',
}

export default function CancelamentoPage() {
  return (
    <PaginaLegal titulo="Política de Cancelamento e Reembolso">
      <p>
        Esta política vale para a compra da <strong>TRILHA</strong>, vendida pela{' '}
        {EMPRESA.razaoSocial} (CNPJ {EMPRESA.cnpj}), sob a marca {EMPRESA.nomeFantasia}. Ela
        complementa os <Link href="/termos-uso" className="text-mt-green underline">Termos de Uso</Link>.
      </p>

      <Secao titulo="1. Direito de arrependimento — 7 dias">
        <p>
          Conforme o artigo 49 do Código de Defesa do Consumidor (Lei nº 8.078/1990) e o Decreto nº
          7.962/2013, você pode desistir da compra em até <strong>7 (sete) dias corridos</strong>,
          contados da data da confirmação do pagamento, <strong>sem precisar justificar</strong>.
        </p>
        <p>
          Nesse prazo, o reembolso é <strong>integral</strong>: devolvemos todos os valores pagos,
          inclusive os juros do parcelamento, mesmo que você já tenha acessado as aulas, feito
          o Mapa da Vida ou entrado no grupo.
        </p>
      </Secao>

      <Secao titulo="2. Como pedir o cancelamento">
        <p>
          Envie uma mensagem pelo <LinkWhatsApp /> dentro do prazo, informando:
        </p>
        <Lista>
          <li>nome completo;</li>
          <li>e-mail usado na compra;</li>
          <li>que deseja cancelar a compra e receber o reembolso.</li>
        </Lista>
        <p>
          Não há formulário nem pergunta obrigatória. Confirmamos o recebimento do pedido assim que ele
          chega. Vale a data do envio da mensagem: um pedido feito no 7º dia é atendido mesmo que a
          resposta aconteça depois.
        </p>
      </Secao>

      <Secao titulo="3. Prazo e forma do reembolso">
        <p>
          O reembolso é feito pelo mesmo meio de pagamento usado na compra. Solicitamos o estorno ao
          processador de pagamentos ({PROCESSADOR_PAGAMENTO}) em até{' '}
          <strong>5 (cinco) dias úteis</strong> após o pedido.
        </p>
        <Lista>
          <li>
            <strong>Pix:</strong> o valor é devolvido para a conta de origem do pagamento.
          </li>
          <li>
            <strong>Cartão de crédito:</strong> o prazo para o valor aparecer depende do banco emissor —
            normalmente de 5 a 10 dias úteis, podendo levar até duas faturas para constar no extrato.
          </li>
        </Lista>
      </Secao>

      <Secao titulo="4. Compras parceladas">
        <p>
          A TRILHA é um <strong>pagamento único</strong> de {TRILHA_PRECO} à vista, que pode ser
          parcelado em até {TRILHA_PARCELAS_MAX} vezes no cartão com juros. O parcelamento é apenas a
          forma de pagar esse valor — não é assinatura nem mensalidade, e não há renovação automática.
        </p>
        <p>Se você cancelar dentro dos 7 dias, o estorno é do valor total da compra:</p>
        <Lista>
          <li>
            o estorno inclui os <strong>juros do parcelamento</strong>, não só o preço à vista;
          </li>
          <li>
            comunicamos a administradora do cartão para que as <strong>parcelas futuras não sejam
            lançadas</strong> na sua fatura;
          </li>
          <li>
            parcelas que já tenham sido faturadas voltam como <strong>crédito na fatura</strong>,
            conforme o ciclo de fechamento do seu cartão;
          </li>
          <li>
            se alguma parcela ainda aparecer em fatura após o cancelamento, ela será compensada por
            crédito equivalente — basta nos avisar caso isso não aconteça.
          </li>
        </Lista>
        <p>
          A forma exata como o estorno aparece (crédito único ou parcela a parcela) é definida pelo
          banco emissor do cartão, não por nós.
        </p>
      </Secao>

      <Secao titulo="5. Depois dos 7 dias">
        <p>
          Passado o prazo de arrependimento, a compra não é mais reembolsável. A TRILHA é um conteúdo
          digital com acesso imediato e integral desde o primeiro dia.
        </p>
        <p>
          Se a compra foi parcelada, <strong>desistir do curso após os 7 dias não cancela as parcelas
          restantes</strong>: o valor total já foi pago à vista pela administradora do cartão, e as
          parcelas são a forma como você quita esse valor com ela. Seu acesso continua valendo até o
          fim do período contratado.
        </p>
      </Secao>

      <Secao titulo="6. Situações que sempre geram reembolso">
        <Lista>
          <li>cobrança em duplicidade ou valor diferente do anunciado;</li>
          <li>
            impossibilidade de acesso causada por falha nossa que não seja resolvida em prazo razoável
            após você nos avisar.
          </li>
        </Lista>
      </Secao>

      <Secao titulo="7. O que acontece com o acesso">
        <p>
          Com o reembolso, o acesso à plataforma, às aulas, aos materiais e ao grupo de alunos é
          encerrado. Os dados que você registrou (Mapa da Vida, objetivos, rotina) podem ser excluídos a
          seu pedido, conforme a Lei Geral de Proteção de Dados (Lei nº 13.709/2018).
        </p>
      </Secao>

      <Secao titulo="8. Contestação no cartão (chargeback)">
        <p>
          Antes de contestar uma cobrança junto ao banco, fale com a gente: dentro do prazo o reembolso
          é garantido e costuma ser mais rápido que uma contestação. Uma contestação aberta suspende o
          acesso até ser resolvida.
        </p>
      </Secao>

      <Secao titulo="9. Contato">
        <p>
          Dúvidas sobre esta política: <LinkWhatsApp />.
        </p>
      </Secao>
    </PaginaLegal>
  )
}
