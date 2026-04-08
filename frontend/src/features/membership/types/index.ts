export interface Invite {
  workspaceId: string
  senderUsername: string
  recipientUsername: string
  recipientRole: string
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED'
}

export type InviteAction = 'Accept' | 'Reject'
