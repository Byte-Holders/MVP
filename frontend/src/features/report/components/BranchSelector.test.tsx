import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { BranchSelector } from './BranchSelector'

const branches = ['main', 'develop', 'feature/x']

describe('BranchSelector', () => {
  it('dovrebbe mostrare lo skeleton durante il caricamento', () => {
    const { container } = render(
      <BranchSelector
        branches={[]}
        isLoading
        selectedBranch=""
        onChange={vi.fn()}
      />,
    )
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
  })

  it('non dovrebbe mostrare la select durante il caricamento', () => {
    render(
      <BranchSelector
        branches={branches}
        isLoading
        selectedBranch="main"
        onChange={vi.fn()}
      />,
    )
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument()
  })

  it('dovrebbe renderizzare le branch come opzioni', () => {
    render(
      <BranchSelector
        branches={branches}
        isLoading={false}
        selectedBranch="main"
        onChange={vi.fn()}
      />,
    )
    expect(screen.getByRole('option', { name: 'main' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'develop' })).toBeInTheDocument()
    expect(
      screen.getByRole('option', { name: 'feature/x' }),
    ).toBeInTheDocument()
  })

  it('dovrebbe avere il valore selezionato corretto', () => {
    render(
      <BranchSelector
        branches={branches}
        isLoading={false}
        selectedBranch="develop"
        onChange={vi.fn()}
      />,
    )
    expect(screen.getByRole('combobox')).toHaveValue('develop')
  })

  it('dovrebbe chiamare onChange con il valore selezionato', () => {
    const onChange = vi.fn()
    render(
      <BranchSelector
        branches={branches}
        isLoading={false}
        selectedBranch="main"
        onChange={onChange}
      />,
    )
    fireEvent.change(screen.getByRole('combobox'), {
      target: { value: 'develop' },
    })
    expect(onChange).toHaveBeenCalledWith('develop')
  })
})
