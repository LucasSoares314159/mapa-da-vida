'use client'

import Image from 'next/image'
import { motion, useReducedMotion } from 'motion/react'

// Animação de abertura da página de sucesso da compra.
//
// Três atos, nesta ordem: o check se desenha (a confirmação vem primeiro, é o
// que a pessoa precisa ler), explode em partículas e encolhe para virar selo
// enquanto o cérebro-foguete entra em voo e fica flutuando. O título não espera
// a animação: é texto do servidor e aparece junto com o check.
//
// Com prefers-reduced-motion, tudo nasce no estado final — sem voo nem loop.
// A cena inteira é decorativa (aria-hidden): quem comunica a compra é o H1.

const VERDE = '#57AA8F'
const OFF_WHITE = '#EDF2EF'

// Cores das partículas: as da marca mais o rosa e o laranja do próprio mascote,
// para a explosão "pertencer" ao cérebro que chega logo depois.
const PARTICULAS = [
  { angulo: 0, distancia: 104, cor: VERDE, tamanho: 9 },
  { angulo: 32, distancia: 86, cor: '#F7A8B0', tamanho: 7 },
  { angulo: 64, distancia: 112, cor: '#D4A843', tamanho: 6 },
  { angulo: 96, distancia: 92, cor: OFF_WHITE, tamanho: 8 },
  { angulo: 128, distancia: 108, cor: VERDE, tamanho: 6 },
  { angulo: 160, distancia: 84, cor: '#FF8A3D', tamanho: 8 },
  { angulo: 192, distancia: 110, cor: OFF_WHITE, tamanho: 6 },
  { angulo: 224, distancia: 90, cor: '#F7A8B0', tamanho: 9 },
  { angulo: 256, distancia: 106, cor: VERDE, tamanho: 7 },
  { angulo: 288, distancia: 88, cor: '#D4A843', tamanho: 8 },
  { angulo: 320, distancia: 112, cor: OFF_WHITE, tamanho: 6 },
  { angulo: 352, distancia: 94, cor: '#FF8A3D', tamanho: 7 },
]

// Brilhos que piscam em volta do cérebro depois que ele chega.
const BRILHOS = [
  { x: -104, y: -64, tamanho: 14, atraso: 0 },
  { x: 102, y: -96, tamanho: 11, atraso: 0.7 },
  { x: 112, y: 40, tamanho: 13, atraso: 1.3 },
  { x: -96, y: 74, tamanho: 10, atraso: 1.9 },
]

// Fumaça do foguete: sai do canto inferior esquerdo, de onde ele vem.
const FUMACA = [
  { x: -66, y: 52, tamanho: 26, atraso: 1.55 },
  { x: -98, y: 66, tamanho: 20, atraso: 1.65 },
  { x: -126, y: 78, tamanho: 14, atraso: 1.75 },
]

// Posição final do selo de check: canto superior esquerdo, o espaço vazio da
// imagem (o braço do mascote aponta para o outro lado).
const SELO_X = -86
const SELO_Y = -98
const SELO_ESCALA = 0.42

// Momento em que o check vira selo e o foguete entra.
const T_VOO = 1.45

function Estrela({ tamanho }: { tamanho: number }) {
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 24 24" fill={OFF_WHITE}>
      <path d="M12 0c.6 6.2 5.8 11.4 12 12-6.2.6-11.4 5.8-12 12-.6-6.2-5.8-11.4-12-12C6.2 11.4 11.4 6.2 12 0Z" />
    </svg>
  )
}

function CheckDesenhado({ animar }: { animar: boolean }) {
  return (
    <svg viewBox="0 0 96 96" className="h-full w-full" fill="none">
      <motion.circle
        cx="48"
        cy="48"
        r="44"
        fill={VERDE}
        initial={animar ? { scale: 0.6, opacity: 0 } : false}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 16, delay: 0.15 }}
        style={{ originX: '48px', originY: '48px' }}
      />
      <motion.circle
        cx="48"
        cy="48"
        r="44"
        stroke={OFF_WHITE}
        strokeOpacity={0.35}
        strokeWidth="3"
        initial={animar ? { pathLength: 0 } : false}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.55, ease: 'easeInOut' }}
      />
      <motion.path
        d="M29 49.5 42 62l25-27"
        stroke="#fff"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={animar ? { pathLength: 0 } : false}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.4, ease: [0.65, 0, 0.35, 1], delay: 0.45 }}
      />
    </svg>
  )
}

export function CelebracaoCompra() {
  const reduzir = useReducedMotion()
  const animar = !reduzir

  return (
    <div
      aria-hidden="true"
      className="relative mx-auto h-[248px] w-[248px] sm:h-[280px] sm:w-[280px]"
    >
      <div className="absolute left-1/2 top-1/2 h-0 w-0">
        {/* Onda de choque: dois anéis saindo do check quando ele fecha. */}
        {animar &&
          [0, 0.18].map((atraso) => (
            <motion.span
              key={atraso}
              className="absolute -left-12 -top-12 h-24 w-24 rounded-full border-2 border-mt-green"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: [0.8, 2.3], opacity: [0.7, 0] }}
              transition={{ duration: 0.9, ease: 'easeOut', delay: 0.8 + atraso }}
            />
          ))}

        {/* Explosão de partículas. */}
        {animar &&
          PARTICULAS.map((p) => {
            const rad = (p.angulo * Math.PI) / 180
            return (
              <motion.span
                key={p.angulo}
                className="absolute rounded-full"
                style={{
                  width: p.tamanho,
                  height: p.tamanho,
                  left: -p.tamanho / 2,
                  top: -p.tamanho / 2,
                  backgroundColor: p.cor,
                }}
                initial={{ x: 0, y: 0, scale: 0, opacity: 0 }}
                animate={{
                  x: Math.cos(rad) * p.distancia,
                  y: Math.sin(rad) * p.distancia,
                  scale: [0, 1.2, 0.6],
                  opacity: [0, 1, 0],
                }}
                transition={{ duration: 0.95, ease: [0.22, 1, 0.36, 1], delay: 0.82 }}
              />
            )
          })}

        {/* Fumaça do foguete durante o voo. */}
        {animar &&
          FUMACA.map((f) => (
            <motion.span
              key={f.atraso}
              className="absolute rounded-full bg-mt-off-white/25"
              style={{
                width: f.tamanho,
                height: f.tamanho,
                left: f.x - f.tamanho / 2,
                top: f.y - f.tamanho / 2,
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1.4, 1.8], opacity: [0, 0.9, 0] }}
              transition={{ duration: 0.9, ease: 'easeOut', delay: f.atraso }}
            />
          ))}

        {/* Cérebro-foguete: entra do canto inferior esquerdo e passa a flutuar.
            Dois wrappers porque voo (uma vez) e flutuação (loop) têm tempos
            diferentes — no mesmo elemento, um sobrescreveria o outro. */}
        <motion.div
          className="absolute -left-[88px] -top-[107px] h-[214px] w-[176px] sm:-left-[100px] sm:-top-[121px] sm:h-[242px] sm:w-[200px]"
          initial={animar ? { x: -170, y: 90, rotate: -24, scale: 0.35, opacity: 0 } : false}
          animate={{ x: 0, y: 0, rotate: 0, scale: 1, opacity: 1 }}
          transition={{
            delay: T_VOO,
            x: { type: 'spring', stiffness: 70, damping: 13, delay: T_VOO },
            y: { type: 'spring', stiffness: 70, damping: 13, delay: T_VOO },
            rotate: { type: 'spring', stiffness: 80, damping: 10, delay: T_VOO },
            scale: { type: 'spring', stiffness: 90, damping: 14, delay: T_VOO },
            opacity: { duration: 0.2, delay: T_VOO },
          }}
        >
          <motion.div
            className="h-full w-full"
            animate={animar ? { y: [0, -12, 0], rotate: [0, 2, 0] } : undefined}
            transition={{
              duration: 3.4,
              ease: 'easeInOut',
              repeat: Infinity,
              delay: T_VOO + 1.1,
            }}
          >
            <Image
              src="/trilha/cerebro-sucesso.png"
              alt=""
              width={864}
              height={1048}
              priority
              sizes="200px"
              className="h-full w-full object-contain drop-shadow-[0_24px_32px_rgba(3,10,9,0.35)]"
            />
          </motion.div>
        </motion.div>

        {/* Brilhos depois da chegada. */}
        {animar &&
          BRILHOS.map((b) => (
            <motion.span
              key={b.atraso}
              className="absolute"
              style={{ left: b.x - b.tamanho / 2, top: b.y - b.tamanho / 2 }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1, 0], opacity: [0, 1, 0], rotate: [0, 90] }}
              transition={{
                duration: 1.6,
                ease: 'easeInOut',
                repeat: Infinity,
                repeatDelay: 1.4,
                delay: T_VOO + 0.9 + b.atraso,
              }}
            >
              <Estrela tamanho={b.tamanho} />
            </motion.span>
          ))}

        {/* Check: nasce no centro e encolhe para virar selo quando o foguete chega. */}
        <motion.div
          className="absolute -left-12 -top-12 h-24 w-24 rounded-full shadow-[0_10px_30px_-8px_rgba(87,170,143,0.65)]"
          initial={animar ? { x: 0, y: 0, scale: 1 } : false}
          animate={{ x: SELO_X, y: SELO_Y, scale: SELO_ESCALA }}
          transition={{ type: 'spring', stiffness: 160, damping: 18, delay: T_VOO + 0.05 }}
        >
          <CheckDesenhado animar={animar} />
        </motion.div>
      </div>
    </div>
  )
}
