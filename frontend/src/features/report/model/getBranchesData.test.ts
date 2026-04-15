import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getBranchesRepository } from './getBranchesData'

vi.mock('../../../api/apiClient', () => ({
  apiGet: vi.fn(),
  ApiError: class ApiError extends Error {
    status: number
    constructor(status: number, message: string) {
      super(message)
      this.status = status
      this.name = 'ApiError'
    }
  },
}))

import { apiGet, ApiError } from '../../../api/apiClient'

describe('getBranchesRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('dovrebbe restituire la lista di branch', async () => {
    vi.mocked(apiGet).mockResolvedValue(['main', 'develop', 'feature/x'])
    const result = await getBranchesRepository.getBranches('repo-1')
    expect(apiGet).toHaveBeenCalledWith('/api/repositories/repo-1/branches')
    expect(result).toEqual(['main', 'develop', 'feature/x'])
  })

  it('dovrebbe restituire [] in caso di 404', async () => {
    vi.mocked(apiGet).mockRejectedValue(new ApiError(404, 'Non trovato'))
    const result = await getBranchesRepository.getBranches('repo-1')
    expect(result).toEqual([])
  })

  it('dovrebbe restituire [] in caso di 403', async () => {
    vi.mocked(apiGet).mockRejectedValue(new ApiError(403, 'Non autorizzato'))
    const result = await getBranchesRepository.getBranches('repo-1')
    expect(result).toEqual([])
  })

  it('dovrebbe propagare errori diversi da 404/403', async () => {
    vi.mocked(apiGet).mockRejectedValue(new ApiError(500, 'Errore server'))
    await expect(getBranchesRepository.getBranches('repo-1')).rejects.toThrow(
      'Errore server',
    )
  })

  it('dovrebbe propagare errori non-ApiError', async () => {
    vi.mocked(apiGet).mockRejectedValue(new Error('Errore di rete'))
    await expect(getBranchesRepository.getBranches('repo-1')).rejects.toThrow(
      'Errore di rete',
    )
  })
})
