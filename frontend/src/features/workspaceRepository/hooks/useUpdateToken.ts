import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { updateTokenRepository } from '../model/updateTokenData'

const TOKEN_REGEX = /^(ghp_[a-zA-Z0-9]{36}|github_pat_[a-zA-Z0-9_]{82})$/

export function useUpdateToken(
  workspaceId: string,
  repositoryId: string,
  onSaved?: () => void,
) {
  const [token, setToken] = useState('')
  const [clientError, setClientError] = useState<string | null>(null)

  const { mutate, isPending, error } = useMutation({
    mutationFn: (accessToken: string) =>
      updateTokenRepository.updateToken(workspaceId, repositoryId, accessToken),
    onSuccess: () => {
      setToken('')
      onSaved?.()
    },
  })

  function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!TOKEN_REGEX.test(token)) {
      setClientError('Token non valido')
      return
    }
    setClientError(null)
    mutate(token)
  }

  return {
    token,
    setToken,
    isPending,
    clientError,
    serverError: error,
    handleSubmit,
  }
}
