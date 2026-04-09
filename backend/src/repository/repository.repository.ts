import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Repository,
  RepositoryDocument,
} from './schemas/repository.schema';
import type { IRepositoryRepository } from './interfaces/repository.repository.interface';
import { RepositoryEntity } from './entities/repository.entity';

@Injectable()
export class RepositoryRepository implements IRepositoryRepository {
  constructor(
    @InjectModel(Repository.name) private repositoryModel: Model<Repository>,
  ) {}

  async getRepositories(
    repositoryIds: string[],
    searchInput?: string,
  ): Promise<RepositoryEntity[]> {
    const objectIds = repositoryIds.map((id) => new Types.ObjectId(id));
    const filter: Record<string, unknown> = { _id: { $in: objectIds } };
    if (searchInput) {
      filter['name'] = { $regex: searchInput, $options: 'i' };
    }
    const repositories = await this.repositoryModel.find(filter);
    return repositories.map((r) => this.toRepositoryEntity(r));
  }

  async getRepository(repositoryId: string): Promise<RepositoryEntity> {
    const repository = await this.repositoryModel.findById(repositoryId);
    if (!repository) {
      throw new NotFoundException('Repository non trovata');
    }
    return this.toRepositoryEntity(repository);
  }

  async addRepository(
    repositoryUrl: string,
    accessToken?: string,
  ): Promise<string> {
    const urlParts = repositoryUrl
      .replace(/https?:\/\/github\.com\//, '')
      .split('/');
    const [ownerName, name] = urlParts;
    let repository = await this.repositoryModel.findOne({ ownerName, name });
    if (!repository) {
      repository = await this.repositoryModel.create({
        repoId: `${ownerName}/${name}`,
        ownerName,
        name,
        accessToken,
      });
    } else if (accessToken) {
      await this.repositoryModel.updateOne(
        { _id: repository._id },
        { $set: { accessToken } },
      );
    }
    return repository._id.toString();
  }

  async updateToken(repositoryId: string, accessToken: string): Promise<void> {
    const result = await this.repositoryModel.updateOne(
      { _id: repositoryId },
      { $set: { accessToken } },
    );
    if (result.matchedCount === 0) {
      throw new NotFoundException('Repository non trovata');
    }
  }

  private toRepositoryEntity(r: RepositoryDocument): RepositoryEntity {
    return {
      repositoryId: r._id.toString(),
      ownerName: r.ownerName,
      name: r.name,
      dateScan: r.dateScan,
      documentationScore: r.documentationScore,
      codeCoverage: r.codeCoverage,
      cvss: r.cvss,
      accessToken: r.accessToken,
    };
  }
}
