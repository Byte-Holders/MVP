// src/mocks/handlers.ts
import { http, HttpResponse } from 'msw'

// Definisci qui le risposte mock per ogni endpoint del tuo backend. risposte HTTP mock per tutti i test
// Questi sono i default — ogni test può sovrascriverli.
export const handlers = [
  // workspaceRepository
  http.get('/api/workspace/:workspaceId/repositories', () => {
    return HttpResponse.json([])
  }),

  http.post('/api/workspace/:workspaceId/repositories', () => {
    return new HttpResponse(null, { status: 201 })
  }),

  http.delete('/api/workspace/:workspaceId/repositories/:repositoryId', () => {
    return new HttpResponse(null, { status: 200 })
  }),

  // workspace list
  http.get('/api/workspace', () => {
    return HttpResponse.json([])
  }),
]
