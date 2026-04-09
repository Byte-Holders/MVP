import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { addRepositoryData } from '../model/addRepositoryData'

export function useAddRepositoryForm(workspaceId: string) {
  const [url, setUrl] = useState('')
  const [token, setToken] = useState('')
  const [isPrivate, setIsPrivate] = useState(false)
  const queryClient = useQueryClient()

  const { mutate, isPending, error } = useMutation({
    mutationFn: ({
      repositoryUrl,
      accessToken,
    }: {
      repositoryUrl: string
      accessToken?: string
    }) => addRepositoryData(workspaceId, { repositoryUrl, accessToken }),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['repositories', workspaceId],
      })
      setUrl('')
      setToken('')
      setIsPrivate(false)
    },
  })

  function setPublic() {
    setIsPrivate(false)
    setToken('')
  }

  function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!url.trim()) return
    mutate({
      repositoryUrl: url,
      accessToken: isPrivate ? token.trim() || undefined : undefined,
    })
  }

  return {
    url,
    setUrl,
    token,
    setToken,
    isPrivate,
    setPublic,
    setPrivate: () => setIsPrivate(true),
    isPending,
    error,
    handleSubmit,
  }
}
