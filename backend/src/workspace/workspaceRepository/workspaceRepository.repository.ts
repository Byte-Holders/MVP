import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Workspace } from '../schemas/workspace.schema';
import type { IWorkspaceRepository } from './interfaces/workspaceRepository.repository.interface';
import type { RepositoryResponseDto } from './dtos/RepositoryResponseDto';
import type { Repository } from '../schemas/repository.schema';
import type { RepositoryOfWorkspace } from '../schemas/repositoryOfWorkspace.schema';

@Injectable()
export class WorkspaceRepository implements IWorkspaceRepository {
  constructor(
    @InjectModel(Workspace.name) private workspaceModel: Model<Workspace>,
  ) {}

  async getRepositories(workspaceId: string): Promise<RepositoryResponseDto[]> {
    const workspace = await this.workspaceModel
      .findById(workspaceId)
      .populate<{ repositories: { repoId: Repository & { _id: unknown } }[] }>('repositories.repoId');
    if (!workspace) {
      throw new NotFoundException('Workspace non trovato');
    }
    return workspace.repositories.map((r) => ({
      repositoryId: String(r.repoId._id),
      name: r.repoId.name,
      ownerName: r.repoId.ownerName,
    }));
  }

  async addRepository(
    workspaceId: string,
    repositoryId: string,
    gitHubUserToken?: string,
  ): Promise<void> {
    const workspace = await this.workspaceModel.findById(workspaceId);
    if (!workspace) {
      throw new NotFoundException('Workspace non trovato');
    }

    workspace.repositories.push({
      repoId: repositoryId,
      gitHubUserToken,
    } as unknown as RepositoryOfWorkspace);

    await workspace.save();
  }

  async removeRepository(workspaceId: string, repoId: string): Promise<void> {
    const result = await this.workspaceModel.updateOne(
      { _id: workspaceId },
      { $pull: { repositories: { repoId: new Types.ObjectId(repoId) } } },
    );
    if (result.matchedCount === 0) {
      throw new NotFoundException('Workspace non trovato');
    }
    if (result.modifiedCount === 0) {
      throw new NotFoundException('Repository non trovato nel workspace');
    }
  }
}
