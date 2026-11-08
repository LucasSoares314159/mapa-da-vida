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
      fontFamily: {
        sans:      ['DM Sans', 'sans-serif'],
        heading:   ['Space Grotesk', 'sans-serif'],
        editorial: ['Lora', 'serif'],
        // Títulos do funil (quiz → VSL), no padrão da LP /trilha. Carregada
        // só em app/quiz/layout.tsx — a plataforma não usa.
        satoshi:   ['Satoshi', 'DM Sans', 'sans-serif'],
      },
      // Sistema de superfícies da LP /trilha (:root de public/trilha/index.html).
      // Mesmos valores, para o quiz e a LP serem a mesma página aos olhos de
      // quem chega do anúncio.
      boxShadow: {
        'mt-1': '0 14px 30px -20px rgba(42, 63, 69, .28)',
        'mt-2': '0 18px 36px -20px rgba(42, 63, 69, .36)',
        'mt-3': '0 30px 60px -30px rgba(42, 63, 69, .45), 0 8px 20px -12px rgba(42, 63, 69, .2)',
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
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        card:  '16px',
        badge: '20px',
        painel: '24px',
      },
      animation: {
        'check-spring': 'check-spring 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'entrada-cta': 'entrada-cta 0.45s cubic-bezier(0.22, 1, 0.36, 1) both',
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
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config
