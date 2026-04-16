import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ReportPage } from './ReportPage'

vi.mock('../hooks/useReportPage', () => ({ useReportPage: vi.fn() }))
vi.mock('../../workspaceRepository/hooks/useGetRepository', () => ({
  useGetRepository: vi.fn(),
}))
vi.mock('../components/BranchSelector', () => ({
  BranchSelector: () => <div data-testid="branch-selector" />,
}))
vi.mock('#/features/scan/components/ScanButton', () => ({
  ScanButton: () => <div data-testid="scan-button" />,
}))
vi.mock('../components/SummarySection', () => ({
  SummarySection: () => <div data-testid="summary-section" />,
}))
vi.mock('../components/TechSection', () => ({
  TechSection: () => <div data-testid="tech-section" />,
}))
vi.mock('../components/TestSection', () => ({
  TestSection: () => <div data-testid="test-section" />,
}))
vi.mock('../components/SecuritySection', () => ({
  SecuritySection: () => <div data-testid="security-section" />,
}))
vi.mock('../components/DocsSection', () => ({
  DocsSection: () => <div data-testid="docs-section" />,
}))
vi.mock('../components/UpdateTokenForm', () => ({
  UpdateTokenForm: () => <div data-testid="update-token-form" />,
}))

vi.mock('@tanstack/react-query', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-query')>()
  return { ...actual, useQueryClient: vi.fn(() => ({ invalidateQueries: vi.fn() })) }
})

import { useReportPage } from '../hooks/useReportPage'
import { useGetRepository } from '../../workspaceRepository/hooks/useGetRepository'

const defaultReportPage = {
  branches: [],
  branchesLoading: false,
  selectedBranch: 'develop',
  setSelectedBranch: vi.fn(),
  report: undefined,
  reportLoading: false,
  reportError: null,
}

const mockReport = {
  data: {
    depsReport: { vulnerabilities: [], vulnerabilityAnalysis: '', list: [] },
    vulnerabilitiesReport: { vulnerabilities: [], mark: 8 },
    docsReport: { readmeReport: 'ok', commentReport: 'ok', mark: 7 },
    testReport: {
      coverageReport: {
        statements: 80,
        branches: 70,
        functions: 90,
        lines: 80,
      },
      failedTests: [],
      testsRun: 10,
    },
    techReport: { libraries: [], frameworks: [], languages: [] },
  },
}

const props = { workspaceId: 'ws-1', repositoryId: 'repo-1' }

describe('ReportPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useReportPage).mockReturnValue(defaultReportPage)
    vi.mocked(useGetRepository).mockReturnValue({ data: undefined } as any)
  })

  it('dovrebbe renderizzare il nome del repository', () => {
    vi.mocked(useGetRepository).mockReturnValue({
      data: { repositoryId: 'repo-1', name: 'my-repo', ownerName: 'alice' },
    } as any)
    render(<ReportPage {...props} />)
    expect(screen.getByText('my-repo')).toBeInTheDocument()
    expect(screen.getByText('alice')).toBeInTheDocument()
  })

  it('dovrebbe mostrare il BranchSelector e ScanButton', () => {
    render(<ReportPage {...props} />)
    expect(screen.getByTestId('branch-selector')).toBeInTheDocument()
    expect(screen.getByTestId('scan-button')).toBeInTheDocument()
  })

  it('dovrebbe mostrare skeleton durante il caricamento del report', () => {
    vi.mocked(useReportPage).mockReturnValue({
      ...defaultReportPage,
      reportLoading: true,
    })
    const { container } = render(<ReportPage {...props} />)
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
  })

  it('dovrebbe mostrare il messaggio di errore se reportError è presente', () => {
    vi.mocked(useReportPage).mockReturnValue({
      ...defaultReportPage,
      reportError: new Error('Non trovato'),
    })
    render(<ReportPage {...props} />)
    expect(
      screen.getByText('Nessun report disponibile per questo branch.'),
    ).toBeInTheDocument()
  })

  it('dovrebbe mostrare le sezioni del report quando i dati sono disponibili', () => {
    vi.mocked(useReportPage).mockReturnValue({
      ...defaultReportPage,
      report: mockReport as any,
    })
    render(<ReportPage {...props} />)
    expect(screen.getByTestId('tech-section')).toBeInTheDocument()
    expect(screen.getByTestId('test-section')).toBeInTheDocument()
    expect(screen.getByTestId('security-section')).toBeInTheDocument()
    expect(screen.getByTestId('docs-section')).toBeInTheDocument()
  })

  it('dovrebbe mostrare la SummarySection solo se il report ha un summary', () => {
    vi.mocked(useReportPage).mockReturnValue({
      ...defaultReportPage,
      report: { ...mockReport, summary: { summary: 'Ottimo', mark: 9 } } as any,
    })
    render(<ReportPage {...props} />)
    expect(screen.getByTestId('summary-section')).toBeInTheDocument()
  })

  it('non dovrebbe mostrare la SummarySection se il report non ha summary', () => {
    vi.mocked(useReportPage).mockReturnValue({
      ...defaultReportPage,
      report: mockReport as any,
    })
    render(<ReportPage {...props} />)
    expect(screen.queryByTestId('summary-section')).not.toBeInTheDocument()
  })
})
