import { BadRequestException, Injectable } from '@nestjs/common';
import { MembershipRepository } from './membership.repository';
import { IMembershipService } from './interfaces/IMembershipService.interface';
import { InviteUserDto, ManageInviteDto, GetInviteDto } from './dto/membership.dto';

@Injectable()
export class MembershipService implements IMembershipService {
  constructor(private readonly repository: MembershipRepository) {}

  async inviteUser(dto: InviteUserDto): Promise<void> {
    const existingInvite = await this.repository.findPendingInvite(
      dto.recipientUsername, 
      dto.workspace.id
    );

    if (existingInvite) {
      throw new BadRequestException(
        `L'utente ha già un invito pendente per il workspace: ${dto.workspace.name || dto.workspace.id}`
      );
    }

    // Se non esiste (o se ne esistono per altri workspace), procediamo al salvataggio
    await this.repository.saveInvite(dto);
  }

  async getInvites(dto: GetInviteDto): Promise<InviteUserDto[]> {
    const memberships = await this.repository.findByUsername(dto.username);
    
    return memberships.map(m => ({
      workspace: { id: m.workspaceId },
      senderUsername: m.senderUsername,
      recipientUsername: m.recipientUsername,
      recipientRole: m.recipientRole
    }));
  }

  async manageInvite(dto: ManageInviteDto): Promise<void> {
    try {
      await this.repository.updateStatus(dto.username, dto.action);
    } catch (error: unknown) { 

      if (error instanceof Error) {
        throw new BadRequestException(error.message);
      }
      
      throw new BadRequestException('Si è verificato un errore imprevisto');
    }
  }
}