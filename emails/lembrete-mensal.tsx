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

interface LembreteMensalProps {
  nome?: string
  diasDesdeUltimoMapa?: number
  urlNovoMapa?: string
}

export default function LembreteMensal({
  nome = 'Lucas',
  diasDesdeUltimoMapa = 35,
  urlNovoMapa = 'https://mapadavida.mindtrail.com.br/mapa/preparacao',
}: LembreteMensalProps) {
  return (
    <Html lang="pt-BR">
      <Head />
      <Preview>{`Faz ${diasDesdeUltimoMapa} dias desde o seu último diagnóstico. Hora de atualizar seu Mapa da Vida.`}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={headerTag}>MINDTRAIL</Text>
            <Heading style={headerTitle}>Mapa da Vida</Heading>
          </Section>

          <Section style={content}>
            <Text style={greeting}>Olá, <strong>{nome}</strong>!</Text>

            <Text style={paragraph}>
              Faz <strong>{diasDesdeUltimoMapa} dias</strong> desde o seu último diagnóstico.
              Muita coisa pode ter mudado desde então — e você merece ver onde está agora.
            </Text>

            <Text style={paragraph}>
              Seu Mapa da Vida é uma visão sistêmica de como estão as áreas da sua vida.
              São 10 minutos para analisar o seu progresso e pode ser <strong>o que você precisa para retomar o foco.</strong>
            </Text>

            <Section style={buttonContainer}>
              <Button style={button} href={urlNovoMapa}>
                Fazer novo diagnóstico →
              </Button>
            </Section>

            <Hr style={hr} />

            <Text style={footer}>
              Você está recebendo este email porque tem uma conta no Mapa da Vida.{'\n'}
              Para deixar de receber lembretes mensais, acesse suas preferências de conta.
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
