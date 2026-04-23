import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useRegister } from './useRegister'

vi.mock('../model/registerApi', () => ({
  authRepository: {
    register: vi.fn(),
  },
}))

import { authRepository } from '../model/registerApi'

describe('useRegister', () => {
  beforeEach(() => vi.clearAllMocks())

  it('chiama authRepository.register quando register viene invocato', async () => {
    vi.mocked(authRepository.register).mockResolvedValue(undefined)

    const { result } = renderHook(() => useRegister())

    await act(async () => {
      await result.current.register()
    })

    expect(authRepository.register).toHaveBeenCalledTimes(1)
  })

  it('propaga eccezioni di authRepository.register', async () => {
    vi.mocked(authRepository.register).mockRejectedValue(
      new Error('Errore registrazione'),
    )

    const { result } = renderHook(() => useRegister())

    await expect(
      act(async () => {
        await result.current.register()
      }),
    ).rejects.toThrow('Errore registrazione')
  })
})
