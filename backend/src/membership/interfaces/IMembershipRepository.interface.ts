import { AddInviteDto, UpdateInviteDto } from '../dto/membership.dto';
import { Membership } from '../schema/membership.schema';

export interface IMembershipRepository {
  addInvite(addInviteDto: AddInviteDto): Promise<void>;
  updateInvite(updateInviteDto: UpdateInviteDto): Promise<void>;
  findPendingInvites(recipientId: string): Promise<Membership[]>;
}