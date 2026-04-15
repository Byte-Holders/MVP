import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { workspaceMembersRepository } from '../model/workspaceMembersRepository'
import { WORKSPACE_ROLES, type WorkspaceRole } from '../types/workspaceMember'
import type { IInviteMemberViewModel } from '../interfaces/IUseInviteMember'

export function useInviteMember(workspaceId: string): IInviteMemberViewModel {
  const [username, setUsername] = useState('')
  const [role, setRole] = useState<WorkspaceRole>(WORKSPACE_ROLES[0])
  const queryClient = useQueryClient()

  const { mutate, isPending, error, isSuccess } = useMutation({
    mutationFn: () =>
      workspaceMembersRepository.inviteMember(workspaceId, username, role),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['members', workspaceId] })
      setUsername('')
      setRole(WORKSPACE_ROLES[0])
    },
  })

  function handleSubmit(e: SubmitEvent) {
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
