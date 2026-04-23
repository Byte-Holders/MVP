import '@testing-library/jest-dom/vitest'
import { afterEach, beforeAll, afterAll, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import { server } from './mocks/server'

vi.mock('./lib/amplify', () => ({
  cognitoConfig: { domain: 'test-domain', clientId: 'test-client-id' },
}))

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }))

afterEach(() => {
  cleanup() // 2. Pulisce il DOM tra un test e l'altro
  server.resetHandlers()
})

afterAll(() => server.close())
