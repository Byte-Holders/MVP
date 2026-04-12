import { useMembersPage } from '../hooks/useMembersPage'
import { MemberList } from '../components/MemberList'
import { InviteForm } from '../components/InviteForm'

type Props = {
  workspaceId: string
}

export function MembersPage({ workspaceId }: Props) {
  const { members, membersLoading, removeMember, isRemoving, inviteForm } =
    useMembersPage(workspaceId)

  return (
    <div className="flex flex-col gap-6 p-6">
      <h1 className="text-xl font-semibold text-[var(--sea-ink)]">Membri del workspace</h1>

      <div className="rounded-2xl border border-[var(--h-line)] bg-[var(--surface)] p-5">
        <InviteForm
          username={inviteForm.username}
          role={inviteForm.role}
          isPending={inviteForm.isPending}
          error={inviteForm.error}
          isSuccess={inviteForm.isSuccess}
          onUsernameChange={inviteForm.setUsername}
          onRoleChange={inviteForm.setRole}
          onSubmit={inviteForm.handleSubmit}
        />
      </div>

      <div className="rounded-2xl border border-[var(--h-line)] bg-[var(--surface)] p-5">
        {membersLoading ? (
          <div className="flex justify-center py-8 text-sm text-[var(--sea-ink-soft)]">
            Caricamento membri...
          </div>
        ) : (
          <MemberList
            members={members}
            isRemoving={isRemoving}
            onRemove={removeMember}
          />
        )}
      </div>
    </div>
  )
}
