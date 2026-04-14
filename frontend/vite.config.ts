import { defineConfig, mergeConfig } from 'vitest/config'
import { defineConfig as defineViteConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Configurazione Vite pura (plugin, server, proxy)
const viteConfig = defineViteConfig({
  plugins: [
    tanstackRouter({
      routesDirectory: './src/routes',
      generatedRouteTree: './src/routeTree.gen.ts',
    }),
    devtools(),
    tsconfigPaths({ projects: ['./tsconfig.json'] }),
    tailwindcss(),
    viteReact(),
  ],
  server: {
    host: true,
    port: 3000,
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL ?? 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
})

// Configurazione Vitest — merged sopra quella Vite
export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      // Simula il DOM del browser
      environment: 'jsdom',

      // describe/it/expect disponibili senza import in ogni file
      globals: true,

      // Eseguito una volta prima di tutti i test
      setupFiles: ['./src/test-setup.ts'],

      // Trova i test colocati con i sorgenti
      include: ['src/**/*.test.{ts,tsx}'],

      // Esclude i file generati da TanStack Router
      exclude: ['src/routeTree.gen.ts', 'node_modules/**'],
      coverage: {
        provider: 'v8', // Usa il provider V8 per la raccolta della copertura
        reporter: ['text', 'lcov', 'html'], // Formati di report della copertura
        thresholds: {
          lines: 70, // % di righe eseguite almeno una volta
          functions: 70, // % di funzioni chiamate almeno una volta
          branches: 70, // % di rami if/else/ternary coperti
          statements: 70, // % di statement eseguiti (simile a lines)
        },
        reportOnFailure: true,
        include: ['src/**/*.{ts,tsx}'], // Da quali file misurare la coverage
        exclude: [
          // File da NON contare nel denominatore della coverage
          'src/main.tsx',
          'src/router.tsx',
          'src/routeTree.gen.ts',
          'src/styles.css',
          'src/test-setup.ts',
          'src/**/*.d.ts',
          'src/mocks/**',
          'src/components/ui/**',
        ],
      },
    },
  }),
)
