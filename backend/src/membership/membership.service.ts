import { BadRequestException, Injectable } from '@nestjs/common';
import { MembershipRepository } from './membership.repository';
import { IMembershipService } from './interfaces/IMembershipService.interface';
import { InviteUserDto, ManageInviteDto, GetInviteDto, UpdateInviteDto, AddInviteDto, ResearchInviteDto } from './dto/membership.dto';

@Injectable()
export class MembershipService implements IMembershipService {
  constructor(private readonly repository: MembershipRepository) {}

  async inviteUser(inviteUserDto: InviteUserDto): Promise<void> {
    const researchDto: ResearchInviteDto = {
      userId: inviteUserDto.recipientId,
      workspaceId: inviteUserDto.workspaceId
    };
    const existingInvite = await this.repository.findPendingInvite(researchDto);
    // Se esiste un invito per questo workspace, allora blocca
    if (existingInvite) {
      throw new BadRequestException(
        `L'utente ha già un invito pendente per questo workspace (${inviteUserDto.workspaceId})`
      );
    }

    // Se non esiste per questo workspace (anche se ne ha altri per altri workspace) procede
    const repoDto: AddInviteDto = {
      workspaceId: inviteUserDto.workspaceId,
      senderId: inviteUserDto.senderId,
      recipientId: inviteUserDto.recipientId,
      recipientRole: inviteUserDto.recipientRole
    };

    await this.repository.addInvite(repoDto);
  }

  async getInvites(getInviteDto: GetInviteDto): Promise<any[]> {
  // Recupero solo quelli pendenti
  const pendingMemberships = await this.repository.findPendingInvites(getInviteDto.userId);
  
  // Mapping per il frontend
  return pendingMemberships.map(m => ({
    workspaceId: m.workspaceId,
    senderUsername: m.senderId,
    recipientUsername: m.recipientId,
    recipientRole: m.recipientRole,
    // Qui il frontend sa già che sono PENDING, ma lo mettiamo per sicurezza
    status: m.status 
  }));
}

  async manageInvite(manageInviteDto: ManageInviteDto): Promise<void> {
    // Cerca l'invito specifico per recuperare l'ID di MongoDB
    const researchDto: ResearchInviteDto = {
      userId: manageInviteDto.userId, 
      workspaceId: manageInviteDto.workspaceId
    };
    const invite = await this.repository.findPendingInvite(researchDto);

    if (!invite) {
      throw new BadRequestException('Invito non trovato o già gestito');
    }

    // Ora ha l'ID reale (_id) da passare al Repository
    const repoDto: UpdateInviteDto = {
      membershipId: (invite as any)._id.toString(), 
      action: manageInviteDto.action
    };
    
    await this.repository.updateInvite(repoDto);
  }
}