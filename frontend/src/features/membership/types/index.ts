export interface Invite {
  _id: string
  workspaceName: string
  senderUsername: string
  recipientUsername: string
  recipientRole: string
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED'
}

export type InviteAction = 'Accept' | 'Reject'
