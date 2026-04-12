import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { inviteMemberData } from '../model/inviteMemberData'
import { WORKSPACE_ROLES, type WorkspaceRole } from '../types/workspaceMember'

export function useInviteMember(workspaceId: string) {
  const [username, setUsername] = useState('')
  const [role, setRole] = useState<WorkspaceRole>(WORKSPACE_ROLES[0])
  const queryClient = useQueryClient()

  const { mutate, isPending, error, isSuccess } = useMutation({
    mutationFn: () => inviteMemberData(workspaceId, username, role),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['members', workspaceId] })
      setUsername('')
      setRole(WORKSPACE_ROLES[0])
    },
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!username.trim()) return
    mutate()
  }

  return {
    username,
    setUsername,
    role,
    setRole,
    isPending,
    error,
    isSuccess,
    handleSubmit,
  }
}
