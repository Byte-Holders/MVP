import { useForm } from '@tanstack/react-form'
import { useNavigate } from '@tanstack/react-router'
import * as z from 'zod'
import { createWorkspace } from '../model/createWorkspaceApi'
import { useState } from 'react'
import { useRouter } from '@tanstack/react-router'

export const newWorkspaceSchema = z.object({ // validazione lato client con Zod dell'imput del nome del workspace
  name: z
    .string()
    .min(2, 'Workspace name must be at least 2 characters.')
    .max(30, 'Workspace name must be at most 30 characters.'),
})

export function useNewWorkspaceForm() {
  const navigate = useNavigate()
  const [serverError, setServerError] = useState<string | null>(null) // stato per gestire eventuali errori che vengono dal backend (es. nome già esistente → 409 Conflict)
  const router     = useRouter()

  const form = useForm({ //gestione del form: chiama createWorkspaceApi quando vine fatto il submit, e gestisce la validazione con lo schema Zod
    defaultValues: { name: '' },
    validators: { onSubmit: newWorkspaceSchema },
    onSubmit: async ({ value }) => {
      setServerError(null)  // reset errore server ad ogni tentativo
      try {
        const newWorkspace = await createWorkspace({ name: value.name})
        // invalida e ricarica la route corrente → WorkspaceList si aggiorna
        await router.invalidate()
        navigate({ to: `/workspace/${newWorkspace.id}` })
      } catch (error: any) {
        // errore che viene dal backend (es. ConflictException → 409)
        setServerError(error.message)
      }
    },
  })

  return { form, serverError }
}