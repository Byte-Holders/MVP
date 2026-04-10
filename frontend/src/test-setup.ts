// Aggiunge i matcher jest-dom a Vitest
// es: expect(el).toBeInTheDocument(), .toHaveValue(), .toBeDisabled()
import '@testing-library/jest-dom'

// Setup MSW — intercetta le chiamate HTTP durante i test
import { server } from './mocks/server'

// Avvia il server mock prima di tutti i test
beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }))

// Resetta gli handler dopo ogni test
// (evita che un override in un test influenzi il successivo)
afterEach(() => server.resetHandlers())

// Chiude il server dopo tutti i test
afterAll(() => server.close())
