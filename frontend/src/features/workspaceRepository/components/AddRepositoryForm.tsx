import { useAddRepositoryForm } from '../hooks/useAddRepositoryForm'

interface Props {
  workspaceId: string
}

export function AddRepositoryForm({ workspaceId }: Props) {
  const { url, setUrl, token, setToken, isPending, error, handleSubmit } =
    useAddRepositoryForm(workspaceId)

  return (
    <form
      onSubmit={handleSubmit}
      className="island-shell p-5 flex flex-col gap-3"
    >
      <h3 className="font-semibold text-sm island-kicker">
        Aggiungi repository
      </h3>

      <input
        type="url"
        placeholder="URL repository (es. https://github.com/owner/repo)"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        required
        className="w-full rounded-lg border border-[var(--chip-line)] bg-[var(--surface-strong)] px-3 py-2 text-sm text-[var(--sea-ink)] placeholder:text-[var(--sea-ink-soft)] placeholder:opacity-60 outline-none focus:ring-2 focus:ring-[var(--lagoon)]"
      />

      <input
        type="text"
        placeholder="GitHub token"
        value={token}
        onChange={(e) => setToken(e.target.value)}
        className="w-full rounded-lg border border-[var(--chip-line)] bg-[var(--surface-strong)] px-3 py-2 text-sm text-[var(--sea-ink)] placeholder:text-[var(--sea-ink-soft)] placeholder:opacity-60 outline-none focus:ring-2 focus:ring-[var(--lagoon)]"
      />

      {error && (
        <p className="text-sm text-[var(--destructive)]">{error.message}</p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="self-end rounded-lg bg-[var(--lagoon)] px-4 py-2 text-sm font-medium text-white transition-opacity hover:bg-[var(--lagoon-deep)] disabled:opacity-50"
      >
        {isPending ? 'Aggiunta...' : 'Aggiungi'}
      </button>
    </form>
  )
}
