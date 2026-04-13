import { InviteUserInfo } from '../type/inviteUser.type';
import { ManageInviteInfo } from '../type/manageInvite.type';
import { MembershipPopulatedInfo } from '../type/memberhsipPopulated.type';


export interface IMembershipService {
  inviteUser(inviteUserInfo: InviteUserInfo): Promise<void>;
  getInvites(userId: string): Promise<MembershipPopulatedInfo[]>;
  manageInvite(manageInviteInfo: ManageInviteInfo): Promise<void>;
}

export const IMembershipServiceToken = 'IMembershipService';