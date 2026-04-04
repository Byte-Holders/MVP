import { InviteUserDto, ManageInviteDto, GetInviteDto } from '../dto/membership.dto';

export interface IMembershipService {
  inviteUser(inviteDto: InviteUserDto): Promise<void>;
  getInvites(getInviteDto: GetInviteDto): Promise<InviteUserDto[]>; 
  manageInvite(manageInviteDto: ManageInviteDto): Promise<void>;
}