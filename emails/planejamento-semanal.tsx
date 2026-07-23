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

interface PlanejamentoSemanalProps {
  nome?: string
  urlDashboard?: string
  momentoFrase?: string
  momentoEstacaoLabel?: string
}

export default function PlanejamentoSemanal({
  nome = 'Lucas',
  urlDashboard = 'https://mapadavida.mindtrail.com.br/objetivos',
  momentoFrase,
  momentoEstacaoLabel,
}: PlanejamentoSemanalProps) {
  return (
    <Html lang="pt-BR">
      <Head />
      <Preview>É domingo. 30 minutos para planejar a semana que começa amanhã.</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={headerTag}>MINDTRAIL</Text>
            <Heading style={headerTitle}>Planejamento Semanal</Heading>
          </Section>

          <Section style={content}>
            <Text style={greeting}>Olá, <strong>{nome}</strong>!</Text>

            <Text style={paragraph}>
              O melhor momento da semana para parar 30 minutos. Pegar a caneta e o papel e planejar a próxima semana.
            </Text>

            {momentoFrase && (
              <Text style={momentoLinha}>
                Seu momento de vida{momentoEstacaoLabel ? ` (${momentoEstacaoLabel})` : ''}:{' '}
                <em>{momentoFrase}</em>. Deixe que ele guie as prioridades da semana.
              </Text>
            )}

            <Text style={paragraph}>
              <strong>Esse é o passo a passo simples do MOV (Mínima Organização Viável):</strong>
            </Text>

            <Text style={paragraph}>
              → <strong>Liste:</strong> tudo que precisa fazer na vida pessoal e profissional na próxima semana.
            </Text>

            <Text style={paragraph}>
              → <strong>Destaque:</strong> os 3 principais de cada área: aquilo que faria você sentir que progrediu se tiver executado.
            </Text>

            <Text style={paragraph}>
              → <strong>Abra a agenda:</strong> que usa e separe o tempo disponível de foco para trabalhar em cada uma dessas prioridades.
            </Text>

            <Text style={paragraph}>
              → <strong>Revise:</strong> Tire 10 minutos no fim do dia durante a semana para analisar se está no caminho certo ou não.
            </Text>

            <Text style={paragraph}>
              Esse é o mínimo que vai te trazer paz e produtividade para viver mais! ⛰️
            </Text>

            <Text style={paragraph}>
              Revise seus objetivos, relembre seu mapa e entre na semana com clareza.
            </Text>

            <Section style={buttonContainer}>
              <Button style={button} href={urlDashboard}>
                Planejar minha semana →
              </Button>
            </Section>

            <Hr style={hr} />

            <Text style={footer}>
              Você receberá este lembrete todo domingo às 18h.{'\n'}
              Para deixar de receber, acesse suas preferências de conta.
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

const momentoLinha: React.CSSProperties = {
  fontSize: '14px',
  color: '#6f8f87',
  lineHeight: '1.7',
  margin: '0 0 16px',
  padding: '12px 16px',
  backgroundColor: '#f7faf9',
  borderRadius: '8px',
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
