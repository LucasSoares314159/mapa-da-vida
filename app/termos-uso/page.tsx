import type { Metadata } from 'next'
import Link from 'next/link'
import { PaginaLegal, Secao, Lista, LinkWhatsApp } from '@/components/legal/PaginaLegal'
import { EMPRESA, PROCESSADOR_PAGAMENTO, TRILHA_PARCELAS_MAX, TRILHA_PRECO } from '@/lib/empresa'

export const metadata: Metadata = {
  title: 'Termos de Uso',
  description:
    'Condições de compra e de uso da Trilha da Produtividade e da plataforma MindTrail.',
}

export default function TermosUsoPage() {
  return (
    <PaginaLegal titulo="Termos de Uso">
      <p>
        Estes Termos regulam a compra e o uso da <strong>Trilha da Produtividade</strong> e da
        plataforma {EMPRESA.nomeFantasia} ({EMPRESA.site}), oferecidas pela {EMPRESA.razaoSocial},
        inscrita no CNPJ sob o nº {EMPRESA.cnpj}, com sede na {EMPRESA.endereco} (&quot;
        {EMPRESA.nomeFantasia}&quot;, &quot;nós&quot;).
      </p>
      <p>
        Ao concluir a compra ou criar sua conta, você declara ter lido e aceitado estes Termos e a{' '}
        <Link href="/cancelamento" className="text-mt-green underline">
          Política de Cancelamento e Reembolso
        </Link>
        .
      </p>

      <Secao titulo="1. O que está sendo contratado">
        <p>A Trilha da Produtividade é um programa online que inclui:</p>
        <Lista>
          <li>aulas gravadas, organizadas em módulos;</li>
          <li>
            acesso à plataforma com as ferramentas Mapa da Vida, Momento de Vida, Objetivos e Calculadora
            de Rotina;
          </li>
          <li>materiais de apoio e frameworks;</li>
          <li>grupo de alunos no WhatsApp, com acesso direto ao autor para dúvidas.</li>
        </Lista>
        <p>
          O acesso vale por <strong>12 (doze) meses</strong>, contados da confirmação do pagamento. O
          conteúdo pode ser atualizado, reorganizado ou ampliado ao longo desse período, sem custo
          adicional e sem redução do que foi anunciado na compra.
        </p>
      </Secao>

      <Secao titulo="2. Preço e pagamento">
        <p>
          A Trilha é vendida por <strong>pagamento único</strong> de{' '}
          <strong>{TRILHA_PRECO} à vista</strong>, ou parcelado em até {TRILHA_PARCELAS_MAX} vezes no
          cartão de crédito, <strong>com juros</strong>.
        </p>
        <Lista>
          <li>
            O parcelamento é apenas a forma de pagamento do valor total: não se trata de assinatura,
            mensalidade ou cobrança recorrente, e não há renovação automática.
          </li>
          <li>
            No parcelamento, o valor de cada parcela, a taxa de juros e o valor total a pagar são
            exibidos no checkout antes da confirmação da compra. O valor total parcelado é, portanto,
            maior que o preço à vista.
          </li>
          <li>
            O pagamento é processado por empresa terceirizada ({PROCESSADOR_PAGAMENTO}). Não
            armazenamos os dados do seu cartão.
          </li>
        </Lista>
      </Secao>

      <Secao titulo="3. Liberação do acesso">
        <p>
          Após a confirmação do pagamento, enviamos ao e-mail informado na compra um link pessoal para
          criar sua conta. O link tem validade limitada e pode ser usado uma única vez; se expirar ou não
          chegar, peça um novo pelo <LinkWhatsApp />. Confira também as pastas de spam e promoções.
        </p>
      </Secao>

      <Secao titulo="4. Conta pessoal e intransferível">
        <Lista>
          <li>A conta é individual. Não é permitido compartilhar login, senha ou o link de acesso.</li>
          <li>
            Você é responsável por manter suas credenciais em sigilo e pelas atividades feitas na sua
            conta.
          </li>
          <li>Para contratar, é preciso ter 18 anos ou mais, ou estar assistido pelo responsável legal.</li>
        </Lista>
      </Secao>

      <Secao titulo="5. Propriedade intelectual">
        <p>
          Aulas, textos, frameworks, materiais, marcas e a própria plataforma são protegidos pela Lei de
          Direitos Autorais (Lei nº 9.610/1998) e pertencem à {EMPRESA.razaoSocial} ou a seus
          licenciantes. A compra concede uma licença de uso <strong>pessoal, não exclusiva e
          intransferível</strong>, válida pelo período de acesso.
        </p>
        <p>É proibido, sem autorização por escrito:</p>
        <Lista>
          <li>gravar, baixar, copiar, reproduzir ou distribuir as aulas e materiais;</li>
          <li>revender, sublicenciar ou disponibilizar o conteúdo a terceiros;</li>
          <li>usar o conteúdo para criar cursos, mentorias ou produtos concorrentes.</li>
        </Lista>
      </Secao>

      <Secao titulo="6. Natureza do conteúdo e resultados">
        <p>
          A Trilha é um programa educacional de organização pessoal. Os resultados dependem da aplicação
          de cada pessoa e <strong>não são garantidos</strong>. Depoimentos exibidos na página de venda
          refletem experiências individuais.
        </p>
        <p>
          As ferramentas da plataforma, incluindo o Mapa da Vida, são instrumentos de reflexão e{' '}
          <strong>não substituem</strong> acompanhamento médico, psicológico, financeiro ou de qualquer
          outro profissional de saúde ou especialista.
        </p>
      </Secao>

      <Secao titulo="7. Conduta no grupo e na plataforma">
        <p>
          Esperamos respeito nas interações. Podemos remover do grupo, suspender ou encerrar o acesso de
          quem violar estes Termos — compartilhar a conta, distribuir o conteúdo, praticar assédio,
          discriminação ou spam —, sem direito a reembolso fora do prazo legal de arrependimento.
        </p>
      </Secao>

      <Secao titulo="8. Privacidade e dados pessoais">
        <p>
          Tratamos seus dados conforme a Lei Geral de Proteção de Dados (Lei nº 13.709/2018), apenas para
          prestar o serviço, liberar o acesso, enviar comunicações sobre a Trilha e cumprir obrigações
          legais. As respostas que você registra na plataforma (Mapa da Vida, objetivos, rotina) são
          suas: não são vendidas nem compartilhadas com terceiros para fins comerciais.
        </p>
        <p>
          Você pode pedir acesso, correção ou exclusão dos seus dados a qualquer momento pelo{' '}
          <LinkWhatsApp />.
        </p>
      </Secao>

      <Secao titulo="9. Disponibilidade">
        <p>
          Trabalhamos para manter a plataforma disponível, mas podem ocorrer interrupções para
          manutenção ou por falhas de terceiros (hospedagem, vídeo, internet). Os vídeos são exibidos
          pelo YouTube e dependem da disponibilidade desse serviço.
        </p>
      </Secao>

      <Secao titulo="10. Cancelamento e reembolso">
        <p>
          Você tem <strong>7 dias</strong> para desistir da compra, com reembolso integral, nos termos do
          artigo 49 do Código de Defesa do Consumidor. Todas as regras, inclusive para compras
          parceladas, estão na{' '}
          <Link href="/cancelamento" className="text-mt-green underline">
            Política de Cancelamento e Reembolso
          </Link>
          .
        </p>
      </Secao>

      <Secao titulo="11. Alterações destes Termos">
        <p>
          Podemos atualizar estes Termos. A versão vigente fica sempre nesta página, com a data da última
          atualização. Mudanças não reduzem direitos de quem já comprou durante o período de acesso
          contratado.
        </p>
      </Secao>

      <Secao titulo="12. Lei aplicável e foro">
        <p>
          Estes Termos são regidos pelas leis brasileiras, em especial o Código de Defesa do Consumidor.
          Fica eleito o foro do domicílio do consumidor para resolver eventuais questões.
        </p>
      </Secao>

      <Secao titulo="13. Contato">
        <p>
          Atendimento: <LinkWhatsApp />.
        </p>
      </Secao>
    </PaginaLegal>
  )
}
