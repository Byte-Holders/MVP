import { useForm } from '@tanstack/react-form'
import { useNavigate } from '@tanstack/react-router'
import { getCurrentUser } from 'aws-amplify/auth'
import * as z from 'zod'
import { createWorkspace } from '../model/createWorkspaceApi'

export const newWorkspaceSchema = z.object({
  name: z
    .string()
    .min(2, 'Workspace name must be at least 2 characters.')
    .max(30, 'Workspace name must be at most 30 characters.'),
})

export function useNewWorkspaceForm() {
  const navigate = useNavigate()

  const form = useForm({
    defaultValues: { name: '' },
    validators: { onSubmit: newWorkspaceSchema },
    onSubmit: async ({ value }) => {
      try {
        const { username } = await getCurrentUser()
        const result = await createWorkspace({ name: value.name, createdBy: username })
        console.log('Risposta dal backend:', result) 
        navigate({ to: '/workspaces' })
      } catch (error) {
        console.error(error)
        // puoi aggiungere toast di errore qui
      }
    },
  })

  return { form }
}