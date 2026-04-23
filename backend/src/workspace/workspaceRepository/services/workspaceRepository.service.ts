import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { IWorkspaceRepositoryService } from '../interfaces/workspaceRepository.service.interface';
import type { IWorkspaceRepositoryRepository } from '../interfaces/workspaceRepository.repository.interface';
import { WorkspaceRepositoryToken } from '../interfaces/workspaceRepository.repository.interface';
import type { IRepositoryReader } from '../../../repository/interfaces/repository.reader.interface';
import { RepositoryReaderToken } from '../../../repository/interfaces/repository.reader.interface';
import type { IRepositoryWriter } from '../../../repository/interfaces/repository.writer.interface';
import { RepositoryWriterToken } from '../../../repository/interfaces/repository.writer.interface';
import type { RepositoryInfo } from '../../../repository/types/repository-info';

@Injectable()
export class WorkspaceRepositoryService implements IWorkspaceRepositoryService {
  constructor(
    @Inject(WorkspaceRepositoryToken)
    private workspaceRepositoryRepository: IWorkspaceRepositoryRepository,
    @Inject(RepositoryReaderToken)
    private repositoryReader: IRepositoryReader,
    @Inject(RepositoryWriterToken)
    private repositoryWriter: IRepositoryWriter,
  ) {}

  async getRepositories(
    workspaceId: string,
    searchInput?: string,
  ): Promise<RepositoryInfo[]> {
    const ids =
      await this.workspaceRepositoryRepository.getRepositories(workspaceId);
    if (ids.length === 0) {
      return [];
    }
    return this.repositoryReader.getRepositories(ids, searchInput);
  }

  async addRepository(
    workspaceId: string,
    repositoryUrl: string,
    accessToken?: string,
  ): Promise<void> {
    const repositoryId = await this.repositoryWriter.addRepository(
      repositoryUrl,
      accessToken,
    );
    await this.workspaceRepositoryRepository.addRepository(
      workspaceId,
      repositoryId,
    );
  }

  async removeRepository(
    repositoryId: string,
    workspaceId: string,
  ): Promise<void> {
    return this.workspaceRepositoryRepository.removeRepository(
      repositoryId,
      workspaceId,
    );
  }

  async updateToken(
    repositoryId: string,
    workspaceId: string,
    accessToken: string,
  ): Promise<void> {
    const ids =
      await this.workspaceRepositoryRepository.getRepositories(workspaceId);
    if (!ids.includes(repositoryId)) {
      throw new NotFoundException('Repository non trovata nel workspace');
    }
    await this.repositoryWriter.updateToken(repositoryId, accessToken);
  }
}
