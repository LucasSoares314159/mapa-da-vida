import { defineConfig } from 'vitest/config'
import { resolve } from 'node:path'

// Só o motor do quiz é testado por enquanto: funções puras, sem DOM.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['lib/**/*.test.ts'],
  },
  resolve: {
    alias: { '@': resolve(__dirname, '.') },
  },
})
