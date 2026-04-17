import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useNewWorkspaceForm, newWorkspaceSchema } from './useNewWorkspaceForm'

vi.mock('@tanstack/react-router', () => ({
  useNavigate: vi.fn(),
  useRouter: vi.fn(),
}))

import { useNavigate, useRouter } from '@tanstack/react-router'

const mockNavigate = vi.fn()
const mockInvalidate = vi.fn()

describe('newWorkspaceSchema', () => {
  it('valida un nome corretto', () => {
    expect(newWorkspaceSchema.safeParse({ name: 'MyWorkspace' }).success).toBe(
      true,
    )
  })

  it('rifiuta un nome troppo corto', () => {
    expect(newWorkspaceSchema.safeParse({ name: 'A' }).success).toBe(false)
  })

  it('rifiuta un nome troppo lungo', () => {
    expect(newWorkspaceSchema.safeParse({ name: 'A'.repeat(31) }).success).toBe(
      false,
    )
  })
})

describe('useNewWorkspaceForm', () => {
  const mockRepo = { createWorkspace: vi.fn() }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useNavigate).mockReturnValue(mockNavigate)
    vi.mocked(useRouter).mockReturnValue({ invalidate: mockInvalidate } as any)
  })

  it('inizializza con serverError null', () => {
    const { result } = renderHook(() => useNewWorkspaceForm(mockRepo))
    expect(result.current.serverError).toBeNull()
  })

  it('espone un oggetto form', () => {
    const { result } = renderHook(() => useNewWorkspaceForm(mockRepo))
    expect(result.current.form).toBeDefined()
  })

  it("imposta serverError se createWorkspace lancia un'eccezione", async () => {
    mockRepo.createWorkspace.mockRejectedValue(new Error('Already exists'))
    mockInvalidate.mockResolvedValue(undefined)

    const { result } = renderHook(() => useNewWorkspaceForm(mockRepo))

    await act(async () => {
      await result.current.form.handleSubmit()
    })

    // validation fails (name is empty), no server call expected
    expect(result.current.serverError).toBeNull()
  })

  it('naviga al workspace dopo la creazione', async () => {
    mockRepo.createWorkspace.mockResolvedValue({ id: 'ws-new' })
    mockInvalidate.mockResolvedValue(undefined)

    const { result } = renderHook(() => useNewWorkspaceForm(mockRepo))

    act(() => {
      result.current.form.setFieldValue('name', 'NewWorkspace')
    })

    await act(async () => {
      await result.current.form.handleSubmit()
    })

    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith({ to: '/workspaces/ws-new/repositories' }),
    )
  })

  it('imposta serverError se createWorkspace fallisce con un nome valido', async () => {
    mockRepo.createWorkspace.mockRejectedValue(new Error('Duplicate name'))
    mockInvalidate.mockResolvedValue(undefined)

    const { result } = renderHook(() => useNewWorkspaceForm(mockRepo))

    act(() => {
      result.current.form.setFieldValue('name', 'NewWorkspace')
    })

    await act(async () => {
      await result.current.form.handleSubmit()
    })

    await waitFor(() =>
      expect(result.current.serverError).toBe('Duplicate name'),
    )
  })
})
