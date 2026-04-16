import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { addRepositoryRepository } from '../model/addRepositoryData'
import type { IAddRepositoryFormViewModel } from '../interfaces/viewModel/IUseAddRepositoryForm'

export function useAddRepositoryForm(
  workspaceId: string,
): IAddRepositoryFormViewModel {
  const [url, setUrl] = useState('')
  const [token, setToken] = useState<string>('')
  const queryClient = useQueryClient()

  const { mutate, isPending, error } = useMutation({
    mutationFn: ({
      repositoryUrl,
      accessToken,
    }: {
      repositoryUrl: string
      accessToken?: string
    }) =>
      addRepositoryRepository.addRepository(workspaceId, {
        repositoryUrl,
        accessToken,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['repositories', workspaceId],
      })
      setUrl('')
      setToken('')
    },
  })

  function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!url.trim()) return
    mutate({
      repositoryUrl: url,
      accessToken: token.trim() || undefined,
    })
  }

  return {
    url,
    setUrl,
    token,
    setToken,
    isPending,
    error,
    handleSubmit,
  }
}
