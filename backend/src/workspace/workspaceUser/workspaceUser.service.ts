import {
  Inject,
  Injectable,
  NotFoundException,
  PreconditionFailedException,
} from '@nestjs/common';
import { IAddUserToWorkspace } from './interfaces/IAddUserToWorkspace.interface';
import { IWorkspaceUserService } from './interfaces/IWorkspaceUserService';
import type { IUserRoleReader } from './interfaces/IUserRoleReader';
import {
  type IWorkspaceUserRepository,
  IWorkspaceUserRepositoryToken,
} from './interfaces/IWorkspaceUserRepository.interface';
import { UserOfWorkspaceInfo } from './type/userOfWorkspace.type';
import { ICheckIfUserInWorkspace } from './interfaces/ICheckIfUserInWorkspace';
import { WorkspaceRole } from '../roles.enum';

@Injectable()
export class WorkspaceUserService
  implements
    IWorkspaceUserService,
    IAddUserToWorkspace,
    IUserRoleReader,
    ICheckIfUserInWorkspace
{
  constructor(
    @Inject(IWorkspaceUserRepositoryToken)
    private workspaceUserRepository: IWorkspaceUserRepository,
  ) {}

  async getUsersOfWorkspace(workspaceId: string) {
    return await this.workspaceUserRepository.getUsersOfWorkspace(workspaceId);
  }

  async removeUserFromWorkspace(
    workspaceId: string,
    userId: string,
    removerOfUserId: string,
  ) {
    if (
      (await this.workspaceUserRepository.getUserRoleForRepository(
        workspaceId,
        removerOfUserId,
      )) != WorkspaceRole.PROJECT_MANAGER
    ) {
      throw new PreconditionFailedException(
        "L'utente per poter rimuovere deve essere project manager del workspace",
      );
    }
    if (
      !(await this.workspaceUserRepository.checkIfUserIsInWorkspace(
        workspaceId,
        userId,
      ))
    ) {
      throw new NotFoundException(
        "L'utente con id " +
          userId +
          ' non è un membro del workspace con id ' +
          workspaceId,
      );
    }
    if (
      (await this.workspaceUserRepository.getWorkspaceOwner(workspaceId)) ===
      userId
    ) {
      throw new PreconditionFailedException(
        "L'utente che si tenta di rimuovere è il proprietario del workspace",
      );
    }
    await this.workspaceUserRepository.removeUserFromWorkspace(
      workspaceId,
      userId,
    );
  }

  async getUserRoleForRepository(repositoryId: string, userId: string) {
    return this.workspaceUserRepository.getUserRoleForRepository(
      repositoryId,
      userId,
    );
  }

  async addUserToWorkspace(user: UserOfWorkspaceInfo, workspaceId: string) {
    if (
      await this.workspaceUserRepository.checkIfUserIsInWorkspace(
        workspaceId,
        user.userId,
      )
    ) {
      throw new PreconditionFailedException(
        "L'utente con id " +
          user.userId +
          ' è già un membro del workspace con id ' +
          workspaceId,
      );
    }
    await this.workspaceUserRepository.addUserToWorkspace(user, workspaceId);
  }

  async checkIfUserIsInWorkspace(workspaceId: string, userId: string) {
    return await this.workspaceUserRepository.checkIfUserIsInWorkspace(
      workspaceId,
      userId,
    );
  }
}
