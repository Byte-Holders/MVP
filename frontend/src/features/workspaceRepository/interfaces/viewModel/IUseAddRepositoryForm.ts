export interface IAddRepositoryFormViewModel {
  url: string
  setUrl: (url: string) => void
  token: string
  setToken: (token: string) => void
  isPrivate: boolean
  setPublic: () => void
  setPrivate: () => void
  isPending: boolean
  error: Error | null
  handleSubmit: (e: React.SyntheticEvent<HTMLFormElement>) => void
}
