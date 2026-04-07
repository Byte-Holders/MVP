import { Membership } from '../schema/membership.schema';

export interface IMembershipRepository {
  addInvite(inviteData: { workspaceId: string; senderId: string; recipientId: string; recipientRole: string }): Promise<void>;
  updateInvite(membershipId: string, status: string): Promise<void>;
  findPendingInvites(recipientId: string): Promise<Membership[]>;
  findPendingInvite(recipientId: string, workspaceId: string): Promise<Membership | null>;
}