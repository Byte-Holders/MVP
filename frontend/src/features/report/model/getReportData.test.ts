import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getReportRepository } from './getReportData'

vi.mock('../../../api/apiClient', () => ({
  apiGet: vi.fn(),
}))

import { apiGet } from '../../../api/apiClient'

const mockReport = {
  data: {
    depsReport: { vulnerabilities: [], vulnerabilityAnalysis: '' },
    vulnerabilitiesReport: { vulnerabilities: [], mark: 0 },
    docsReport: { readmeReport: '', commentReport: '', mark: 0 },
    testReport: { coverageReport: { statements: 0, branches: 0, functions: 0, lines: 0 }, failedTests: [], testsRun: 0 },
    techReport: { libraries: [], frameworks: [], languages: [] },
  },
}

describe('getReportRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('dovrebbe chiamare apiGet con il percorso corretto', async () => {
    vi.mocked(apiGet).mockResolvedValue(mockReport)
    const result = await getReportRepository.getReport('repo-1', 'develop')
    expect(apiGet).toHaveBeenCalledWith(
      '/api/repositories/repo-1/branches/develop/report',
    )
    expect(result).toEqual(mockReport)
  })

  it('dovrebbe codificare correttamente il nome della branch', async () => {
    vi.mocked(apiGet).mockResolvedValue(mockReport)
    await getReportRepository.getReport('repo-1', 'feature/my branch')
    expect(apiGet).toHaveBeenCalledWith(
      '/api/repositories/repo-1/branches/feature%2Fmy%20branch/report',
    )
  })

  it('dovrebbe propagare gli errori della API', async () => {
    vi.mocked(apiGet).mockRejectedValue(new Error('Report non trovato'))
    await expect(getReportRepository.getReport('repo-1', 'main')).rejects.toThrow('Report non trovato')
  })
})
