import { useState } from 'react'
import { useAddRepository } from '../hooks/useAddRepository'

interface Props {
  workspaceId: string
}

export function AddRepositoryForm({ workspaceId }: Props) {
  const [url, setUrl] = useState('')
  const [token, setToken] = useState('')
  const { mutate: addRepository, isPending, error } = useAddRepository(workspaceId)

  function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!url.trim()) return
    addRepository(
      { repositoryUrl: url, accessToken: token.trim() || undefined },
      {
        onSuccess: () => {
          setUrl('')
          setToken('')
        },
      },
    )
  }

  return (
    <form onSubmit={handleSubmit} className="island-shell p-5 flex flex-col gap-3">
      <h3 className="font-semibold text-sm island-kicker">Aggiungi repository</h3>
      <input
        type="url"
        placeholder="URL repository (es. https://github.com/owner/repo)"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        required
        className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--primary)]"
      />
      <input
        type="text"
        placeholder="GitHub token"
        value={token}
        onChange={(e) => setToken(e.target.value)}
        required
        className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--primary)]"
      />
      {error && (
        <p className="text-sm text-[var(--destructive)]">{error.message}</p>
      )}
      <button
        type="submit"
        disabled={isPending}
        className="self-end rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white transition-opacity disabled:opacity-50"
      >
        {isPending ? 'Aggiunta...' : 'Aggiungi'}
      </button>
    </form>
  )
}
