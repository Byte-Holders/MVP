import { BadRequestException, Injectable } from '@nestjs/common';
import { MembershipRepository } from './membership.repository';
import { InviteUserDto, ManageInviteDto, GetInviteDto, ManageInviteAction } from './dto/membership.dto';
@Injectable()
export class MembershipService {
  constructor(private readonly repository: MembershipRepository) {}

  async inviteUser(inviteUserDto: InviteUserDto): Promise<void> {
    // Passiamo stringhe dirette al posto del ResearchInviteDto
    const existingInvite = await this.repository.findPendingInvite(
      inviteUserDto.recipientId, 
      inviteUserDto.workspaceId
    );

    if (existingInvite) {
      throw new BadRequestException(
        `L'utente ha già un invito pendente per questo workspace (${inviteUserDto.workspaceId})`
      );
    }

    // Passiamo un oggetto anonimo invece di AddInviteDto
    await this.repository.addInvite({
      workspaceId: inviteUserDto.workspaceId,
      senderId: inviteUserDto.senderId,
      recipientId: inviteUserDto.recipientId,
      recipientRole: inviteUserDto.recipientRole
    });
  }

  async getInvites(getInviteDto: GetInviteDto): Promise<any[]> {
    const pendingMemberships = await this.repository.findPendingInvites(getInviteDto.userId);
    
    return pendingMemberships.map(m => ({
      workspaceId: m.workspaceId,
      senderUsername: m.senderId,
      recipientUsername: m.recipientId,
      recipientRole: m.recipientRole,
      status: m.status 
    }));
  }

  async manageInvite(manageInviteDto: ManageInviteDto): Promise<void> {
    // Passiamo stringhe dirette al posto del ResearchInviteDto
    const invite = await this.repository.findPendingInvite(
      manageInviteDto.userId, 
      manageInviteDto.workspaceId
    );

    if (!invite) {
      throw new BadRequestException('Invito non trovato o già gestito');
    }

    // Mappiamo l'enum ManageInviteAction (Accept/Reject) nel formato stringa atteso dal DB (ACCEPTED/REJECTED)
    const newStatus = manageInviteDto.action === ManageInviteAction.Accept ? 'ACCEPTED' : 'REJECTED';

    // Passiamo stringhe dirette invece di UpdateInviteDto
    await this.repository.updateInvite((invite as any)._id.toString(), newStatus);
  }
}