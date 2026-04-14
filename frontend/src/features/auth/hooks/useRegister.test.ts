import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useRegister } from './useRegister'

vi.mock('../model/registerApi', () => ({
  registerUser: vi.fn(),
}))

import { registerUser } from '../model/registerApi'
const mockRegisterUser = registerUser as ReturnType<typeof vi.fn>

describe('useRegister', () => {
  beforeEach(() => vi.clearAllMocks())

  it('chiama registerUser quando register viene invocato', async () => {
    mockRegisterUser.mockResolvedValue(undefined)

    const { result } = renderHook(() => useRegister())

    await act(async () => {
      await result.current.register()
    })

    expect(mockRegisterUser).toHaveBeenCalledTimes(1)
  })

  it('propaga eccezioni di registerUser', async () => {
    mockRegisterUser.mockRejectedValue(new Error('Errore registrazione'))

    const { result } = renderHook(() => useRegister())

    await expect(
      act(async () => {
        await result.current.register()
      }),
    ).rejects.toThrow('Errore registrazione')
  })
})
