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

interface MomentoRevisaoProps {
  nome?: string
  estacaoLabel?: string
  estacaoEmoji?: string
  frase?: string
  duracaoLabel?: string
  urlMomento?: string
}

export default function MomentoRevisao({
  nome = 'Lucas',
  estacaoLabel = 'Construir',
  estacaoEmoji = '🏗️',
  frase = 'focar no trabalho e pensar no longo prazo',
  duracaoLabel = '3 meses',
  urlMomento = 'https://mapadavida.mindtrail.com.br/momento',
}: MomentoRevisaoProps) {
  return (
    <Html lang="pt-BR">
      <Head />
      <Preview>{`A fase que você definiu (${duracaoLabel}) chegou ao fim. Ainda é esse o seu momento?`}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={headerTag}>MINDTRAIL</Text>
            <Heading style={headerTitle}>É hora de revisar seu momento</Heading>
          </Section>

          <Section style={content}>
            <Text style={greeting}>Olá, <strong>{nome}</strong>!</Text>

            <Text style={paragraph}>
              Há {duracaoLabel}, você parou para definir a fase que estava vivendo:
            </Text>

            <Text style={momentoBox}>
              {estacaoEmoji} <strong>{estacaoLabel}</strong>
              {'\n'}
              {frase}
            </Text>

            <Text style={paragraph}>
              Esse foi o princípio que guiou seus objetivos e sua rotina nesse tempo. Mas a vida
              muda — e o seu momento também pode ter mudado.
            </Text>

            <Text style={paragraph}>
              <strong>Ainda é esse o seu momento?</strong> Ou algo pede uma nova direção agora?
              Vale parar dois minutos para olhar e decidir.
            </Text>

            <Section style={buttonContainer}>
              <Button style={button} href={urlMomento}>
                Revisar meu momento →
              </Button>
            </Section>

            <Hr style={hr} />

            <Text style={footer}>
              Você está recebendo este email porque a duração que você definiu para o seu
              momento de vida terminou.{'\n'}
              Para redefinir ou ajustar, acesse seu momento na conta.
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

const momentoBox: React.CSSProperties = {
  fontSize: '16px',
  color: '#1a2e35',
  lineHeight: '1.6',
  margin: '0 0 20px',
  padding: '18px 22px',
  backgroundColor: '#f0f7f4',
  borderLeft: '3px solid #57aa8f',
  borderRadius: '4px',
  whiteSpace: 'pre-line',
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
