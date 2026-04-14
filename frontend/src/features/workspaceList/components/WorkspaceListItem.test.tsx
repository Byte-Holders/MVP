import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { WorkspaceListItem } from './WorkspaceListItem'

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

describe('WorkspaceListItem Component', () => {
  const mockWorkspace = {
    id: 'ws-1',
    name: 'My Workspace',
    owner: 'john',
    role: 'admin',
  }

  it('dovrebbe mostrare il nome del workspace', () => {
    render(<WorkspaceListItem workspace={mockWorkspace} />)
    expect(screen.getByText('My Workspace')).toBeInTheDocument()
  })

  it("dovrebbe mostrare l'owner del workspace", () => {
    render(<WorkspaceListItem workspace={mockWorkspace} />)
    expect(screen.getByText('Owner: john')).toBeInTheDocument()
  })

  it('dovrebbe mostrare il ruolo del workspace', () => {
    render(<WorkspaceListItem workspace={mockWorkspace} />)
    expect(screen.getByText('Role: admin')).toBeInTheDocument()
  })

  it('dovrebbe mostrare la prima lettera del nome come icona', () => {
    render(<WorkspaceListItem workspace={mockWorkspace} />)
    expect(screen.getByText('M')).toBeInTheDocument()
  })

  it('dovrebbe convertire in maiuscolo la prima lettera del nome', () => {
    const ws = { ...mockWorkspace, name: 'alpha project' }
    render(<WorkspaceListItem workspace={ws} />)
    expect(screen.getByText('A')).toBeInTheDocument()
  })
})
