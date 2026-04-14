import { setupServer } from 'msw/node'
import { handlers } from './handlers'

// setupServer (non setupWorker) perché gira in Node durante i test
export const server = setupServer(...handlers)
