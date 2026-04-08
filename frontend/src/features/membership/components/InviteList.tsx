import { InviteElement } from './InviteElement'
import { useGetInvites } from '../hooks/UseGetInvite'

export function InviteList() {
  const { invites, loading, refresh } = useGetInvites()

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-[var(--text-secondary)]">
          Caricamento inviti...
        </div>
      </div>
    )
  }

  if (invites.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-[var(--text-secondary)]">
          Nessun invito pendente
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {invites.map((invite, index) => (
        <InviteElement key={index} invite={invite} onAction={refresh} />
      ))}
    </div>
  )
}
