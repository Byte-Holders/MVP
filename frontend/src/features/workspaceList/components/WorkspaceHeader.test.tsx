import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { WorkspaceHeader } from './WorkspaceHeader'

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, ...props }: any) => <a {...props}>{children}</a>,
}))

vi.mock('../hooks/useGetWorkspace', () => ({ useGetWorkspace: vi.fn() }))
vi.mock('../../workspaceMembers/hooks/useGetMembers', () => ({ useGetMembers: vi.fn() }))
vi.mock('../../workspaceRepository/hooks/useGetRepositories', () => ({ useGetRepositories: vi.fn() }))

import { useGetWorkspace } from '../hooks/useGetWorkspace'
import { useGetMembers } from '../../workspaceMembers/hooks/useGetMembers'
import { useGetRepositories } from '../../workspaceRepository/hooks/useGetRepositories'

const mockWorkspace = { id: 'ws-1', name: 'My Workspace', owner: 'alice', role: 'OWNER' }

describe('WorkspaceHeader', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useGetMembers).mockReturnValue({ data: undefined } as any)
    vi.mocked(useGetRepositories).mockReturnValue({ data: undefined } as any)
  })

  it('dovrebbe mostrare lo skeleton durante il caricamento', () => {
    vi.mocked(useGetWorkspace).mockReturnValue({ data: undefined, isLoading: true } as any)
    const { container } = render(<WorkspaceHeader workspaceId="ws-1" />)
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
  })

  it('dovrebbe restituire null se workspace non trovato', () => {
    vi.mocked(useGetWorkspace).mockReturnValue({ data: undefined, isLoading: false } as any)
    const { container } = render(<WorkspaceHeader workspaceId="ws-1" />)
    expect(container.firstChild).toBeNull()
  })

  it('dovrebbe mostrare nome e owner del workspace', () => {
    vi.mocked(useGetWorkspace).mockReturnValue({ data: mockWorkspace, isLoading: false } as any)
    render(<WorkspaceHeader workspaceId="ws-1" />)
    expect(screen.getByText('My Workspace')).toBeInTheDocument()
    expect(screen.getByText('alice')).toBeInTheDocument()
  })

  it('dovrebbe mostrare il badge del ruolo', () => {
    vi.mocked(useGetWorkspace).mockReturnValue({ data: mockWorkspace, isLoading: false } as any)
    render(<WorkspaceHeader workspaceId="ws-1" />)
    expect(screen.getByText('OWNER')).toBeInTheDocument()
  })

  it('dovrebbe mostrare le iniziali del workspace nell avatar', () => {
    vi.mocked(useGetWorkspace).mockReturnValue({ data: mockWorkspace, isLoading: false } as any)
    render(<WorkspaceHeader workspaceId="ws-1" />)
    expect(screen.getByText('MW')).toBeInTheDocument()
  })

  it('dovrebbe mostrare il conteggio membri se disponibile', () => {
    vi.mocked(useGetWorkspace).mockReturnValue({ data: mockWorkspace, isLoading: false } as any)
    vi.mocked(useGetMembers).mockReturnValue({ data: [{ id: 'u1' }, { id: 'u2' }] } as any)
    render(<WorkspaceHeader workspaceId="ws-1" />)
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('membri')).toBeInTheDocument()
  })

  it('dovrebbe mostrare il conteggio repository se disponibile', () => {
    vi.mocked(useGetWorkspace).mockReturnValue({ data: mockWorkspace, isLoading: false } as any)
    vi.mocked(useGetRepositories).mockReturnValue({ data: [{ repositoryId: 'r1' }] } as any)
    render(<WorkspaceHeader workspaceId="ws-1" />)
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('repository')).toBeInTheDocument()
  })

  it('non dovrebbe mostrare stats se i dati non sono ancora caricati', () => {
    vi.mocked(useGetWorkspace).mockReturnValue({ data: mockWorkspace, isLoading: false } as any)
    render(<WorkspaceHeader workspaceId="ws-1" />)
    expect(screen.queryByText('membri')).not.toBeInTheDocument()
    expect(screen.queryByText('repository')).not.toBeInTheDocument()
  })

  it('dovrebbe applicare la classe corretta per il ruolo ADMIN', () => {
    vi.mocked(useGetWorkspace).mockReturnValue({
      data: { ...mockWorkspace, role: 'ADMIN' },
      isLoading: false,
    } as any)
    render(<WorkspaceHeader workspaceId="ws-1" />)
    const badge = screen.getByText('ADMIN')
    expect(badge.className).toContain('indigo')
  })

  it('dovrebbe usare la config MEMBER come fallback per ruoli sconosciuti', () => {
    vi.mocked(useGetWorkspace).mockReturnValue({
      data: { ...mockWorkspace, role: 'GUEST' },
      isLoading: false,
    } as any)
    render(<WorkspaceHeader workspaceId="ws-1" />)
    const badge = screen.getByText('GUEST')
    expect(badge.className).toContain('teal')
  })
})
