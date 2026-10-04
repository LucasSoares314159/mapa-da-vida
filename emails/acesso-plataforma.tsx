import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components'

interface AcessoPlataformaProps {
  urlCadastro?: string
  validadeHoras?: number
}
export default function AcessoPlataforma({
  urlCadastro = 'https://mindtrail.com.br/auth/cadastro',
  validadeHoras = 168,
}: AcessoPlataformaProps) {
  const validade = validadeHoras % 24 === 0
    ? `${validadeHoras / 24} dias`
    : `${validadeHoras} horas`

  return (
    <Html lang="pt-BR">
      <Head />
      <Preview>Pagamento confirmado. Crie sua conta para acessar a Trilha.</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={headerTag}>MINDTRAIL</Text>
            <Heading style={headerTitle}>Sua vaga está confirmada</Heading>
          </Section>

          <Section style={content}>
            <Text style={paragraph}>
              Recebemos seu pagamento. Agora falta apenas criar sua conta para entrar na plataforma da Trilha.
            </Text>

            <Section style={buttonContainer}>
              <Button style={button} href={urlCadastro}>
                Criar minha conta
              </Button>
            </Section>

            <Text style={notice}>
              Este link é pessoal, pode ser usado uma única vez e expira em {validade}.
            </Text>

            <Hr style={hr} />

            <Text style={footer}>
              Se você não reconhece esta compra, ignore esta mensagem e entre em contato com o suporte.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

const main: React.CSSProperties = {
  backgroundColor: '#f5f5f5',
  fontFamily: 'sans-serif',
  margin: '0',
  padding: '0',
}

const container: React.CSSProperties = {
  maxWidth: '600px',
  margin: '40px auto',
  backgroundColor: '#ffffff',
  borderRadius: '8px',
  overflow: 'hidden',
}

const header: React.CSSProperties = {
  backgroundColor: '#1a2e35',
  padding: '32px 40px',
}

const headerTag: React.CSSProperties = {
  color: '#9dc8b8',
  fontSize: '12px',
  letterSpacing: '2px',
  textTransform: 'uppercase',
  margin: '0 0 8px',
}

const headerTitle: React.CSSProperties = {
  color: '#edf2ef',
  fontSize: '22px',
  margin: '0',
  fontWeight: '600',
}

const content: React.CSSProperties = { padding: '40px' }

const paragraph: React.CSSProperties = {
  color: '#555555',
  fontSize: '15px',
  lineHeight: '1.7',
  margin: '0 0 16px',
}

const buttonContainer: React.CSSProperties = { margin: '32px 0' }

const button: React.CSSProperties = {
  display: 'inline-block',
  padding: '14px 28px',
  backgroundColor: '#57aa8f',
  color: '#ffffff',
  textDecoration: 'none',
  borderRadius: '8px',
  fontWeight: '600',
  fontSize: '15px',
}

const notice: React.CSSProperties = {
  color: '#6f8f87',
  fontSize: '13px',
  lineHeight: '1.6',
  margin: '0',
}
const hr: React.CSSProperties = {
  border: 'none',
  borderTop: '1px solid #eeeeee',
  margin: '32px 0 20px',
}

const footer: React.CSSProperties = {
  color: '#999999',
  fontSize: '12px',
  lineHeight: '1.6',
  margin: '0',
}
