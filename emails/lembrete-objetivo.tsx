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

interface LembreteObjetivoProps {
  nome?: string
  textoObjetivo?: string
  prazoLabel?: string
  diasRestantes?: number
  urlObjetivos?: string
}

export default function LembreteObjetivo({
  nome = 'Lucas',
  textoObjetivo = 'Treinar 3x por semana',
  prazoLabel = 'curto prazo',
  diasRestantes = 12,
  urlObjetivos = 'https://mapadavida.mindtrail.com.br/objetivos',
}: LembreteObjetivoProps) {
  const prazoTexto = diasRestantes < 0
    ? `O prazo que você definiu já passou há ${Math.abs(diasRestantes)} dia${Math.abs(diasRestantes) === 1 ? '' : 's'}.`
    : diasRestantes === 0
      ? 'O prazo que você definiu é hoje.'
      : `Faltam ${diasRestantes} dia${diasRestantes === 1 ? '' : 's'} para o prazo que você definiu.`

  return (
    <Html lang="pt-BR">
      <Head />
      <Preview>{`Não esqueça: "${textoObjetivo}". ${prazoTexto}`}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={headerTag}>MINDTRAIL</Text>
            <Heading style={headerTitle}>Não esqueça seu plano</Heading>
          </Section>

          <Section style={content}>
            <Text style={greeting}>Olá, <strong>{nome}</strong>!</Text>

            <Text style={paragraph}>
              Esse é o seu objetivo de <strong>{prazoLabel}</strong>:
            </Text>

            <Text style={objetivoBox}>
              {textoObjetivo}
            </Text>

            <Text style={paragraph}>
              {prazoTexto} Como estão as coisas até aqui?
            </Text>

            <Text style={paragraph}>
              Vale parar 2 minutos para olhar de novo pra esse objetivo e decidir o próximo passo.
            </Text>

            <Section style={buttonContainer}>
              <Button style={button} href={urlObjetivos}>
                Ver meu objetivo →
              </Button>
            </Section>

            <Hr style={hr} />

            <Text style={footer}>
              Você está recebendo este email porque definiu um lembrete para este objetivo.{'\n'}
              Para mudar a frequência ou desativar, edite o objetivo em sua conta.
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
  borderRadius: '12px',
  overflow: 'hidden',
  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
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

const content: React.CSSProperties = {
  padding: '40px',
}

const greeting: React.CSSProperties = {
  fontSize: '16px',
  color: '#1a2e35',
  margin: '0 0 16px',
}

const paragraph: React.CSSProperties = {
  fontSize: '15px',
  color: '#555555',
  lineHeight: '1.7',
  margin: '0 0 16px',
}

const objetivoBox: React.CSSProperties = {
  fontSize: '16px',
  color: '#1a2e35',
  fontWeight: '600',
  lineHeight: '1.5',
  margin: '0 0 20px',
  padding: '16px 20px',
  backgroundColor: '#f0f7f4',
  borderLeft: '3px solid #57aa8f',
  borderRadius: '4px',
}

const buttonContainer: React.CSSProperties = {
  margin: '32px 0',
}

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

const hr: React.CSSProperties = {
  border: 'none',
  borderTop: '1px solid #eeeeee',
  margin: '40px 0 24px',
}

const footer: React.CSSProperties = {
  fontSize: '12px',
  color: '#aaaaaa',
  margin: '0',
  lineHeight: '1.6',
}
