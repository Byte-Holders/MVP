import { Injectable, NotFoundException } from '@nestjs/common';
import { IWorkspaceUserRepository } from './interfaces/IWorkspaceUserRepository.interface';
import { InjectModel } from '@nestjs/mongoose';
import { UserOfWorkspaceEntity } from './entity/userOfWorkspace.entity';
import { Workspace } from '../schemas/workspace.schema';
import { Model } from 'mongoose';
import { WorkspaceRole } from '../roles.enum';

@Injectable()
export class WorkspaceUserRepository implements IWorkspaceUserRepository {
  constructor(
    @InjectModel(Workspace.name) private workspaceModel: Model<Workspace>,
  ) {}

  async getUsersOfWorkspace(
    workspaceId: string,
  ): Promise<UserOfWorkspaceEntity[]> {
    const workspace = await this.workspaceModel
      .findById(workspaceId)
      .lean()
      .exec();
    if (!workspace) {
      throw new NotFoundException(
        'workspace con id ' + workspaceId + ' non trovato',
      );
    }
    return workspace.members.map((member) => ({
      userId: member.userId,
      username: member.userUsername,
      role: member.role as WorkspaceRole,
    }));
  }

  async removeUserFromWorkspace(
    workspaceId: string,
    userId: string,
  ): Promise<void> {
    await this.workspaceModel
      .updateOne({ _id: workspaceId }, { $pull: { members: { userId } } })
      .exec();
  }

  async addUserToWorkspace(
    user: UserOfWorkspaceEntity,
    workspaceId: string,
  ): Promise<void> {
    await this.workspaceModel
      .updateOne(
        { _id: workspaceId },
        {
          $push: {
            members: {
              userId: user.userId,
              userUsername: user.username,
              role: user.role,
            },
          },
        },
      )
      .exec();
  }

  async getUserRoleForRepository(
    repositoryId: string,
    userId: string,
  ): Promise<WorkspaceRole | null> {
    const workspace = await this.workspaceModel
      .findOne({
        'repositories.repoId': repositoryId,
        'members.userId': userId,
      } as any)
      .lean()
      .exec();
    if (!workspace) return null;
    const member = workspace.members.find((m) => m.userId === userId);
    return member ? (member.role as WorkspaceRole) : null;
  }

  async checkIfUserIsInWorkspace(
    workspaceId: string,
    userId: string,
  ): Promise<boolean> {
    const workspace = await this.workspaceModel
      .findById(workspaceId)
      .lean()
      .exec();
    if (!workspace) {
      throw new NotFoundException(
        'workspace con id ' + workspaceId + ' non trovato',
      );
    }
    const targetUser = workspace.members.find((member) => {
      return member.userId === userId.toString();
    });
    if (!targetUser) {
      return false;
    }
    return true;
  }

  async getWorkspaceOwner(workspaceId: string): Promise<string> {
    const workspace = await this.workspaceModel
      .findById(workspaceId)
      .lean()
      .exec();
    if (!workspace) {
      throw new NotFoundException(
        'workspace con id ' + workspaceId + ' non trovato',
      );
    }
    return workspace.ownerId.toString();
  }

}
