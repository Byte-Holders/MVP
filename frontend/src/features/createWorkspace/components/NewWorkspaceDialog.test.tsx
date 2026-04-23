import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NewWorkspaceDialog } from './NewWorkspaceDialog'

vi.mock('../hooks/useNewWorkspaceForm', () => ({
  useNewWorkspaceForm: vi.fn(),
}))
vi.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children }: any) => <div>{children}</div>,
  DialogTrigger: ({ children }: any) => <div>{children}</div>,
  DialogContent: ({ children }: any) => <div>{children}</div>,
  DialogHeader: ({ children }: any) => <div>{children}</div>,
  DialogTitle: ({ children }: any) => <h2>{children}</h2>,
  DialogDescription: ({ children }: any) => <p>{children}</p>,
  DialogFooter: ({ children }: any) => <div>{children}</div>,
  DialogClose: ({ children }: any) => <div>{children}</div>,
}))
vi.mock('@/components/ui/field', () => ({
  Field: ({ children }: any) => <div>{children}</div>,
  FieldGroup: ({ children }: any) => <div>{children}</div>,
  FieldLabel: ({ children, htmlFor }: any) => (
    <label htmlFor={htmlFor}>{children}</label>
  ),
  FieldError: ({ errors }: any) => <span>{errors?.[0]}</span>,
}))
vi.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }: any) => (
    <button {...props}>{children}</button>
  ),
}))
vi.mock('@/components/ui/input', () => ({
  Input: (props: any) => <input {...props} />,
}))

import { useNewWorkspaceForm } from '../hooks/useNewWorkspaceForm'

const makeForm = (
  overrides: Partial<{
    value: string
    isTouched: boolean
    isValid: boolean
  }> = {},
) => {
  const { value = '', isTouched = false, isValid = true } = overrides
  return {
    handleSubmit: vi.fn(),
    Field: ({ children }: any) =>
      children({
        name: 'name',
        state: {
          value,
          meta: {
            isTouched,
            isValid,
            errors: isValid ? [] : ['Nome troppo corto'],
          },
        },
        handleBlur: vi.fn(),
        handleChange: vi.fn(),
      }),
  }
}

describe('NewWorkspaceDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useNewWorkspaceForm).mockReturnValue({
      form: makeForm() as any,
      serverError: null,
    })
  })

  it('dovrebbe mostrare il bottone di apertura dialog', () => {
    render(<NewWorkspaceDialog />)
    expect(
      screen.getByRole('button', { name: '+ New Workspace' }),
    ).toBeInTheDocument()
  })

  it('dovrebbe mostrare il titolo e la descrizione del dialog', () => {
    render(<NewWorkspaceDialog />)
    expect(screen.getByText('New Workspace')).toBeInTheDocument()
    expect(screen.getByText(/Create a new workspace/)).toBeInTheDocument()
  })

  it('dovrebbe mostrare il campo Workspace Name', () => {
    render(<NewWorkspaceDialog />)
    expect(screen.getByLabelText('Workspace Name')).toBeInTheDocument()
  })

  it('dovrebbe mostrare i bottoni Cancel e Create Workspace', () => {
    render(<NewWorkspaceDialog />)
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Create Workspace' }),
    ).toBeInTheDocument()
  })

  it('dovrebbe chiamare handleSubmit al submit del form', () => {
    const handleSubmit = vi.fn()
    const form = makeForm()
    form.handleSubmit = handleSubmit
    vi.mocked(useNewWorkspaceForm).mockReturnValue({
      form: form as any,
      serverError: null,
    })
    render(<NewWorkspaceDialog />)
    fireEvent.submit(
      screen.getByRole('button', { name: 'Create Workspace' }).closest('form')!,
    )
    expect(handleSubmit).toHaveBeenCalled()
  })

  it('dovrebbe mostrare il serverError se presente', () => {
    vi.mocked(useNewWorkspaceForm).mockReturnValue({
      form: makeForm() as any,
      serverError: 'Workspace già esistente',
    })
    render(<NewWorkspaceDialog />)
    expect(screen.getByText('Workspace già esistente')).toBeInTheDocument()
  })

  it('dovrebbe mostrare l errore di validazione se il campo è toccato e non valido', () => {
    vi.mocked(useNewWorkspaceForm).mockReturnValue({
      form: makeForm({ isTouched: true, isValid: false }) as any,
      serverError: null,
    })
    render(<NewWorkspaceDialog />)
    expect(screen.getByText('Nome troppo corto')).toBeInTheDocument()
  })

  it('non dovrebbe mostrare l errore se il campo non è stato toccato', () => {
    vi.mocked(useNewWorkspaceForm).mockReturnValue({
      form: makeForm({ isTouched: false, isValid: false }) as any,
      serverError: null,
    })
    render(<NewWorkspaceDialog />)
    expect(screen.queryByText('Nome troppo corto')).not.toBeInTheDocument()
  })
})
