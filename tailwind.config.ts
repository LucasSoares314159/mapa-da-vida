import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      // Sistema visual da LP /trilha, que é o padrão do front inteiro. Os
      // valores moram no :root de app/globals.css (cópia do :root da LP);
      // aqui só viram classes. Componente novo usa token, nunca número solto.
      fontFamily: {
        sans:      ['DM Sans', 'sans-serif'],
        // `heading` e `satoshi` são a mesma fonte: `heading` ficou como alias
        // para os componentes que já o usavam (era Space Grotesk).
        heading:   ['Satoshi', 'DM Sans', 'sans-serif'],
        satoshi:   ['Satoshi', 'DM Sans', 'sans-serif'],
        editorial: ['Lora', 'Georgia', 'serif'],
      },
      // Escala tipográfica da LP. Títulos em Satoshi 500 minúsculo; o peso 700
      // é só para o destaque (<em>) e títulos de card.
      fontSize: {
        // H1 de hero (.hero-headline)
        display:        ['clamp(34px, 5.4vw, 64px)', { lineHeight: '1.08', letterSpacing: '-0.02em' }],
        // H1 de página e H2 de seção (h2 da LP: 36px, 28px no mobile)
        titulo:         ['clamp(28px, 3.2vw, 36px)', { lineHeight: '1.15', letterSpacing: '-0.02em' }],
        // Título de bloco dentro da página (h3 de painel)
        subtitulo:      ['24px', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
        // Título de card (h3 de card)
        'titulo-card':  ['19px', { lineHeight: '1.3', letterSpacing: '-0.01em' }],
        // Apoio em Lora (.hero-sub e afins)
        apoio:          ['19px', { lineHeight: '1.6' }],
        // Texto corrido (body da LP)
        corpo:          ['17px', { lineHeight: '1.75' }],
        // Rótulo de seção (.sec-label): caixa alta espaçada
        rotulo:         ['11px', { lineHeight: '1.4', letterSpacing: '0.09em' }],
      },
      spacing: {
        card:      'var(--pad-card)',
        'card-lg': 'var(--pad-card-lg)',
        painel:    'var(--pad-painel)',
        titulo:    'var(--espaco-titulo)',
        pilha:     'var(--gap-pilha)',
        grade:     'var(--gap-grade)',
      },
      borderWidth: {
        // A hairline da LP (--linha). Contorno e divisória são sempre ela.
        linha: '0.5px',
      },
      boxShadow: {
        'mt-1': 'var(--sombra-1)',
        'mt-2': 'var(--sombra-2)',
        'mt-3': 'var(--sombra-3)',
      },
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        'mt-green':      '#57AA8F',
        'mt-green-dark': '#2A3F45',
        'mt-off-white':  '#EDF2EF',
        'mt-black':      '#0C0F0F',
        'mt-border':     '#c8d8d2',
        'mt-surface':    '#ffffff',
        'mt-yellow':     '#D4A843',
        'mt-red':        '#C05050',
        'mt-muted':      '#6f8f87',
        // Texto de apoio sobre fundo claro. O mt-muted dá ~3.4:1 e reprova no
        // AA como cor de texto; este dá 4.7:1 no off-white e 5.3:1 no branco.
        'mt-apoio':      '#5B6F73',
        'mt-green-sup':  '#E8F5F1',
        // Linha e contorno sobre o verde escuro (a hairline do fundo claro some ali).
        'mt-linha-escura': '#3d5a62',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        elemento: 'var(--raio-sm)',
        card:     'var(--raio-card)',
        painel:   'var(--raio-painel)',
        badge:    '20px',
      },
      animation: {
        'check-spring': 'check-spring 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'entrada-cta': 'entrada-cta 0.45s cubic-bezier(0.22, 1, 0.36, 1) both',
        // Monitor de Hábitos: a celebração ao marcar é forte de propósito
        // (recompensa sem punição — ver CLAUDE.md). Todas saem com
        // motion-reduce:animate-none nos componentes.
        'habito-pop':       'habito-pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'habito-onda':      'habito-onda 0.7s ease-out forwards',
        'habito-particula': 'habito-particula 0.75s ease-out forwards',
        'habito-subir':     'habito-subir 1s ease-out forwards',
        'habito-entrar':    'habito-entrar 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both',
        'habito-festa':     'habito-festa 1.1s cubic-bezier(0.2, 0.7, 0.3, 1) forwards',
      },
      keyframes: {
        'check-spring': {
          '0%': { transform: 'scale(0)' },
          '50%': { transform: 'scale(1.2)' },
          '100%': { transform: 'scale(1)' },
        },
        // Botao de compra da VSL surgindo: sobe pouco e aparece, sem quique —
        // a pessoa esta assistindo, e movimento chamativo tira o olho do video.
        'entrada-cta': {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'habito-pop': {
          '0%': { transform: 'scale(1)' },
          '35%': { transform: 'scale(1.35)' },
          '65%': { transform: 'scale(0.92)' },
          '100%': { transform: 'scale(1)' },
        },
        'habito-onda': {
          '0%': { transform: 'scale(0.85)', opacity: '0.55' },
          '100%': { transform: 'scale(1.45)', opacity: '0' },
        },
        // A partícula sai do centro para fora; a direção vem da rotação do pai.
        'habito-particula': {
          '0%': { transform: 'translateY(-46px) scale(1)', opacity: '1' },
          '100%': { transform: 'translateY(-96px) scale(0.3)', opacity: '0' },
        },
        'habito-subir': {
          '0%': { transform: 'translateY(6px)', opacity: '0' },
          '20%': { transform: 'translateY(0)', opacity: '1' },
          '100%': { transform: 'translateY(-34px)', opacity: '0' },
        },
        'habito-entrar': {
          '0%': { transform: 'scale(0.85)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'habito-festa': {
          '0%': { transform: 'translateY(-40px) scale(1.2)', opacity: '1' },
          '100%': { transform: 'translateY(-210px) scale(0.3)', opacity: '0' },
        },
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config
