import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components'

interface ObjetivoConcluidoProps {
  nome?: string
  textoObjetivo?: string
  urlObjetivos?: string
}

export default function ObjetivoConcluido({
  nome = 'Lucas',
  textoObjetivo = 'Treinar 3x por semana',
}: ObjetivoConcluidoProps) {
  return (
    <Html lang="pt-BR">
      <Head />
      <Preview>{`Você chegou no prazo com "${textoObjetivo}" concluído. Bom trabalho.`}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={headerTag}>MINDTRAIL</Text>
            <Heading style={headerTitle}>Bom progresso 🎯</Heading>
          </Section>

          <Section style={content}>
            <Text style={greeting}>Olá, <strong>{nome}</strong>!</Text>

            <Text style={paragraph}>
              Hoje é o prazo que você tinha definido para este objetivo — e ele já está concluído:
            </Text>

            <Text style={objetivoBox}>
              {textoObjetivo}
            </Text>

            <Text style={paragraph}>
              Vale parar um instante para reconhecer isso. Você definiu um prazo, se organizou e chegou lá. Isso não é pouco.
            </Text>

            <Text style={paragraph}>
              Quando quiser, defina o próximo objetivo e siga construindo esse ritmo.
            </Text>

            <Hr style={hr} />

            <Text style={footer}>
              Você está recebendo este email porque concluiu um objetivo no prazo definido.{'\n'}
              Para gerenciar seus objetivos, acesse sua conta.
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
  textDecoration: 'line-through',
  textDecorationColor: '#57aa8f',
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
