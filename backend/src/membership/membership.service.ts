import {
  BadRequestException,
  Injectable,
  Inject,
  NotFoundException,
  PreconditionFailedException,
} from '@nestjs/common';
import { MembershipRepository } from './membership.repository';
import { ManageInviteAction, MembershipStatus } from './dto/membership.dto';
import { type IFindUserByUsername } from '../user/interfaces/IfindUserByUsername.interface';
import { FindUserByUsernameToken } from '../user/interfaces/IfindUserByUsername.interface';
import { UserInfo } from '../user/types/user.type';
import { InviteUserInfo } from './type/inviteUser.type';
import { IMembershipService } from './interfaces/IMembershipService.interface';
import { MembershipPopulatedInfo } from './type/memberhsipPopulated.type';
import { MembershipPopulatedEntity } from './entity/membershipPopulated.entity';
import { CreateMembershipEntityParams } from './entity/createMembershipEntityParams';
import { ManageInviteInfo } from './type/manageInvite.type';
import { type IAddUserToWorkspace } from '../workspace/workspaceUser/interfaces/IAddUserToWorkspace.interface';
import { IAddUserToWorkspaceToken } from '../workspace/workspaceUser/interfaces/IAddUserToWorkspace.interface';
import { UserOfWorkspaceInfo } from '../workspace/workspaceUser/type/userOfWorkspace.type';
import { IMembershipRepositoryToken } from './interfaces/IMembershipRepository.interface';

@Injectable()
export class MembershipService implements IMembershipService {
  constructor(
    @Inject(IMembershipRepositoryToken)
    private readonly repository: MembershipRepository,
    @Inject(FindUserByUsernameToken)
    private readonly findUserByUsername: IFindUserByUsername,
    @Inject(IAddUserToWorkspaceToken)
    private readonly addUserToWorkspace: IAddUserToWorkspace,
  ) {}

  async inviteUser(inviteUserInfo: InviteUserInfo): Promise<void> {
    const user: UserInfo | null = await this.findUserByUsername.findByUsername(
      inviteUserInfo.recipientUsername,
    );

    if (!user) {
      throw new NotFoundException(
        `Utente con username ${inviteUserInfo.recipientUsername} non trovato`,
      );
    }

    const existingPendingInvite = await this.repository.findPendingInvite(
      user._id,
      inviteUserInfo.workspaceId,
    );

    if (existingPendingInvite) {
      throw new BadRequestException(
        `L'utente ha già un invito pendente per questo workspace (${inviteUserInfo.workspaceId})`,
      );
    }
    const createMembershipEntityParams: CreateMembershipEntityParams = {
      workspaceId: inviteUserInfo.workspaceId,
      senderId: inviteUserInfo.senderId,
      recipientId: user._id,
      recipientRole: inviteUserInfo.recipientRole,
      status: MembershipStatus.Pending,
    };

    await this.repository.addInvite(createMembershipEntityParams);
  }

  async getInvites(userId: string): Promise<MembershipPopulatedInfo[]> {
    const pendingMemberships: MembershipPopulatedEntity[] =
      await this.repository.findPendingInvites(userId);
    return pendingMemberships;
  }

  async manageInvite(manageInviteInfo: ManageInviteInfo): Promise<void> {
    const invite = await this.repository.findPendingInviteById(
      manageInviteInfo.id,
    );
    if (!invite) {
      throw new BadRequestException('Invito non trovato o già gestito');
    }

    const populatedInvites = await this.repository.findPendingInvites(
      invite.recipientId,
    );
    const userUsername = populatedInvites.find(
      (invite) => invite._id === manageInviteInfo.id,
    )?.recipientUsername; //username dell'utente da raggiungere

    if (!userUsername) {
      throw new Error(
        "errore nel recupero dell'username dell'utente destinatario dell'invito",
      );
    }

    if (manageInviteInfo.action === ManageInviteAction.Accept) {
      const userToAdd =
        await this.findUserByUsername.findByUsername(userUsername);
      if (!userToAdd) {
        throw new NotFoundException(
          `Utente con username ${userUsername} non trovato`,
        );
      }
      const userOfWorkspaceInfo: UserOfWorkspaceInfo = {
        userId: userToAdd._id,
        username: userToAdd.username,
        role: invite.recipientRole,
      };
      try {
        await this.addUserToWorkspace.addUserToWorkspace(
          userOfWorkspaceInfo,
          invite.workspaceId,
        );
      } catch (error) {
        if (error instanceof PreconditionFailedException) {
          await this.repository.updateInvite(
            manageInviteInfo.id,
            MembershipStatus.Rejected,
          );
          throw new PreconditionFailedException(
            "l'utente è già un membro del workspace, quindi l'invito è stato rifiutato",
          );
        } else {
          throw error;
        }
      }
      await this.repository.updateInvite(
        manageInviteInfo.id,
        MembershipStatus.Accepted,
      );
    } else {
      await this.repository.updateInvite(
        manageInviteInfo.id,
        MembershipStatus.Rejected,
      );
    }
  }
}
