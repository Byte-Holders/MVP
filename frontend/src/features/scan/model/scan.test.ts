import { describe, it, expect, vi, beforeEach } from 'vitest'
import { scanRepository } from './scan'

vi.mock('../../../api/apiClient', () => ({
  apiPost: vi.fn(),
  apiPatch: vi.fn(),
}))

import { apiPost, apiPatch } from '../../../api/apiClient'

describe('scanRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('requestScan', () => {
    it('dovrebbe restituire il scanId dalla risposta', async () => {
      vi.mocked(apiPost).mockResolvedValue({ scanId: 'scan-abc' })
      const result = await scanRepository.requestScan({
        workspaceId: 'ws-1',
        repositoryId: 'repo-1',
        branch: 'develop',
      })
      expect(result).toBe('scan-abc')
    })

    it('dovrebbe chiamare apiPost con il payload corretto', async () => {
      vi.mocked(apiPost).mockResolvedValue({ scanId: 'scan-xyz' })
      const payload = {
        workspaceId: 'ws-1',
        repositoryId: 'repo-1',
        branch: 'main',
      }
      await scanRepository.requestScan(payload)
      expect(apiPost).toHaveBeenCalledWith('/api/scan', payload)
    })

    it('dovrebbe propagare gli errori della API', async () => {
      vi.mocked(apiPost).mockRejectedValue(new Error('Errore di rete'))
      await expect(
        scanRepository.requestScan({
          workspaceId: 'ws-1',
          repositoryId: 'repo-1',
          branch: 'main',
        }),
      ).rejects.toThrow('Errore di rete')
    })
  })

  describe('stopScan', () => {
    it('dovrebbe chiamare apiPatch con il scanId corretto', async () => {
      vi.mocked(apiPatch).mockResolvedValue(undefined)
      await scanRepository.stopScan('scan-abc')
      expect(apiPatch).toHaveBeenCalledWith('/api/scan/scan-abc')
    })

    it('dovrebbe propagare gli errori della API', async () => {
      vi.mocked(apiPatch).mockRejectedValue(new Error('Stop fallito'))
      await expect(scanRepository.stopScan('scan-abc')).rejects.toThrow(
        'Stop fallito',
      )
    })
  })
})
