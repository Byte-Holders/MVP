import { useForm } from '@tanstack/react-form'
import { useNavigate, useRouter } from '@tanstack/react-router'
import * as z from 'zod'
import { useState } from 'react'
import { createWorkspaceRepository } from '../model/createWorkspaceApi'
import type { ICreateWorkspaceRepository } from '../interfaces/model/ICreateWorkspaceRepository'
import type { CreateWorkspaceRequest } from '../types/CreateWorkspace'
import type { INewWorkspaceFormViewModel } from '../interfaces/viewModel/IUseNewWorkspaceForm'

export const newWorkspaceSchema = z.object({
  name: z
    .string()
    .min(2, 'Workspace name must be at least 2 characters.')
    .max(30, 'Workspace name must be at most 30 characters.'),
})

export function useNewWorkspaceForm(
  repo: ICreateWorkspaceRepository = createWorkspaceRepository,
): INewWorkspaceFormViewModel {
  const navigate = useNavigate()
  const [serverError, setServerError] = useState<string | null>(null)
  const router = useRouter()

  const form = useForm({
    defaultValues: { name: '' },
    validators: { onSubmit: newWorkspaceSchema },
    onSubmit: async ({ value }: { value: CreateWorkspaceRequest }) => {
      setServerError(null)
      try {
        const newWorkspace = await repo.createWorkspace({ name: value.name })
        await router.invalidate()
        navigate({ to: `/workspace/${newWorkspace.id}` })
      } catch (error: any) {
        setServerError(error.message)
      }
    },
  })

  return { form, serverError }
}
