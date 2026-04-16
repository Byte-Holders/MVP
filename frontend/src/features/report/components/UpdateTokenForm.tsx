import { useUpdateToken } from '#/features/workspaceRepository/hooks/useUpdateToken'

interface Props {
  workspaceId: string
  repositoryId: string
}

export function UpdateTokenForm({ workspaceId, repositoryId }: Props) {
  const { token, setToken, isPending, clientError, serverError, handleSubmit } =
    useUpdateToken(workspaceId, repositoryId)

  return (
    <form onSubmit={handleSubmit} className="flex items-start gap-2">
      <div className="flex flex-col gap-1">
        <input
          type="text"
          placeholder="GitHub token"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-[var(--primary)]"
        />
        {(clientError ?? serverError) && (
          <p className="text-xs text-[var(--destructive)]">
            {clientError ?? serverError?.message}
          </p>
        )}
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-[var(--primary)] px-3 py-1.5 text-sm font-medium text-white transition-opacity disabled:opacity-50"
      >
        {isPending ? '...' : 'Aggiorna token'}
      </button>
    </form>
  )
}
