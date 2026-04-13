import { CreateMembershipEntityParams } from '../entity/createMembershipEntityParams';
import { MembershipEntity } from '../entity/membership.entity';
import { MembershipPopulatedEntity } from '../entity/membershipPopulated.entity';

export interface IMembershipRepository {
  addInvite(
    createMembershipEntityParams: CreateMembershipEntityParams,
  ): Promise<void>;
  updateInvite(membershipId: string, status: string): Promise<void>;
  findPendingInvites(recipientId: string): Promise<MembershipPopulatedEntity[]>;
  findPendingInvite(
    recipientId: string,
    workspaceId: string,
  ): Promise<MembershipEntity | null>;
  findPendingInviteById(membershipId: string): Promise<MembershipEntity | null>;
}

export const IMembershipRepositoryToken = 'IMembershipRepository';
