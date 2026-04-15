import type { Invite } from '../../types'

export interface IGetInvitesRepository {
  getInvites(): Promise<Invite[]>
}
