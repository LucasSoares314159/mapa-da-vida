import { defineConfig } from 'vitest/config'
import { resolve } from 'node:path'

// Funções puras de lib e rotas de API (com Supabase e fetch falsos), sem DOM.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['lib/**/*.test.ts', 'app/**/*.test.ts'],
  },
  resolve: {
    alias: { '@': resolve(__dirname, '.') },
  },
})
