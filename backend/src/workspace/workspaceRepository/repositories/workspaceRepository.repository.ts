import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Workspace } from '../../schemas/workspace.schema';
import type { IWorkspaceRepositoryRepository } from '../interfaces/workspaceRepository.repository.interface';

@Injectable()
export class WorkspaceRepositoryRepository implements IWorkspaceRepositoryRepository {
  constructor(
    @InjectModel(Workspace.name) private workspaceModel: Model<Workspace>,
  ) {}

  async getRepositories(workspaceId: string): Promise<string[]> {
    const workspace = await this.workspaceModel.findById(workspaceId);
    if (!workspace) {
      throw new NotFoundException('Workspace non trovato');
    }
    return workspace.repositories.map((r) => r.repoId.toString());
  }

  async addRepository(
    workspaceId: string,
    repositoryId: string,
  ): Promise<void> {
    const result = await this.workspaceModel.updateOne(
      { _id: workspaceId },
      { $push: { repositories: { repoId: new Types.ObjectId(repositoryId) } } },
    );
    if (result.matchedCount === 0) {
      throw new NotFoundException('Workspace non trovato');
    }
  }

  async removeRepository(
    repositoryId: string,
    workspaceId: string,
  ): Promise<void> {
    const result = await this.workspaceModel.updateOne(
      { _id: workspaceId },
      { $pull: { repositories: { repoId: new Types.ObjectId(repositoryId) } } },
    );
    if (result.matchedCount === 0) {
      throw new NotFoundException('Workspace non trovato');
    }
    if (result.modifiedCount === 0) {
      throw new NotFoundException('Repository non trovata nel workspace');
    }
  }
}
