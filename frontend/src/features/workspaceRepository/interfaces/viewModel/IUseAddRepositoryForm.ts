export interface IAddRepositoryFormViewModel {
  url: string
  setUrl: (url: string) => void
  token: string
  setToken: (token: string) => void
  isPending: boolean
  error: Error | null
  handleSubmit: (e: React.SyntheticEvent<HTMLFormElement>) => void
}
