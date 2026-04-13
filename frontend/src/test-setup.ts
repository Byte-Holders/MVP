import '@testing-library/jest-dom'
import { expect, afterEach, beforeAll, afterAll } from 'vitest'
import { cleanup } from '@testing-library/react'
import * as matchers from '@testing-library/jest-dom/matchers' // <--- Importa i matcher
import { server } from './mocks/server'

// 1. Estende l'oggetto expect di Vitest con i matcher del DOM
expect.extend(matchers)

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }))

afterEach(() => {
  cleanup() // 2. Pulisce il DOM tra un test e l'altro
  server.resetHandlers()
})

afterAll(() => server.close())
