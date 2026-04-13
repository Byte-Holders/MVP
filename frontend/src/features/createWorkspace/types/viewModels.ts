import type { FormApi } from '@tanstack/react-form'

export interface INewWorkspaceFormViewModel {
  form: FormApi<{ name: string }>
  serverError: string | null
}
