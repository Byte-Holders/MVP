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
  console.log('dentro useNewWorkspaceForm') // Debug log per verificare l'esecuzione del hook
  const navigate = useNavigate()

  const form = useForm({
    
    defaultValues: { name: '' },
    validators: { onSubmit: newWorkspaceSchema },
    onSubmit: async ({ value }) => {
      try {console.log('dentro useForm try') // Debug log per verificare l'esecuzione del hook
        const { username } = await getCurrentUser()
        console.log('dentro useForm try dopo getCurrentUser', username) // Debug log per verificare l'esecuzione del hook
        const result = await createWorkspace({ name: value.name, createdBy: username })
        console.log('dentro useForm try dopo createWorkspcace', result)
        console.log('Risposta dal backend:', result) 
        navigate({ to: '/repository' })
      } catch (error) {
        console.error(error)
        // puoi aggiungere toast di errore qui
      }
    },
  })

  return { form }
}