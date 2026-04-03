import { InviteUserDto, ManageInviteDto, GetInviteDto } from '../dto/membership.dto';

export interface IMembershipService {
  inviteUser(dto: InviteUserDto): Promise<void>;
  getInvites(dto: GetInviteDto): Promise<InviteUserDto[]>; 
  manageInvite(dto: ManageInviteDto): Promise<void>;
}