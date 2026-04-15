import { Inject, Injectable } from '@nestjs/common';
import type { IRepositoryWriter } from '../interfaces/repository.writer.interface';
import type { IRepositoryFindRepository } from '../interfaces/repository.find-repository.interface';
import { RepositoryFindRepositoryToken } from '../interfaces/repository.find-repository.interface';
import type { IRepositoryPersistRepository } from '../interfaces/repository.persist-repository.interface';
import { RepositoryPersistRepositoryToken } from '../interfaces/repository.persist-repository.interface';
import type { IGitHubAccessRepository } from '../interfaces/github.access-repository.interface';
import { GitHubAccessRepositoryToken } from '../interfaces/github.access-repository.interface';

@Injectable()
export class RepositoryWriterService implements IRepositoryWriter {
  constructor(
    @Inject(RepositoryFindRepositoryToken)
    private readonly repositoryFindRepository: IRepositoryFindRepository,
    @Inject(RepositoryPersistRepositoryToken)
    private readonly repositoryPersistRepository: IRepositoryPersistRepository,
    @Inject(GitHubAccessRepositoryToken)
    private readonly gitHubRepository: IGitHubAccessRepository,
  ) {}

  async addRepository(
    repositoryUrl: string,
    accessToken?: string,
  ): Promise<string> {
    const [ownerName, name] = repositoryUrl
      .replace(/https?:\/\/github\.com\//, '')
      .split('/');
    if (accessToken) {
      await this.gitHubRepository.verifyAccess(ownerName, name, accessToken);
    }
    return this.repositoryPersistRepository.addRepository(
      ownerName,
      name,
      accessToken,
    );
  }

  async updateToken(repositoryId: string, accessToken: string): Promise<void> {
    const entity =
      await this.repositoryFindRepository.getRepository(repositoryId);
    await this.gitHubRepository.verifyAccess(
      entity.ownerName,
      entity.name,
      accessToken,
    );
    return this.repositoryPersistRepository.updateToken(
      repositoryId,
      accessToken,
    );
  }
}
