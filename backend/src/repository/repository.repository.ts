import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Repository,
  RepositoryDocument,
} from '../workspace/schemas/repository.schema';
import type { IRepositoryRepository } from './interfaces/repository.repository.interface';
import type { AddRepositoryDto } from './dtos/AddRepositoryDto';
import type { RepositoryInfo } from './dtos/RepositoryInfo';

@Injectable()
export class RepositoryRepository implements IRepositoryRepository {
  constructor(
    @InjectModel(Repository.name) private repositoryModel: Model<Repository>,
  ) {}

  async getRepositories(repositoryIds: string[], searchInput?: string): Promise<RepositoryInfo[]> {
    const objectIds = repositoryIds.map((id) => new Types.ObjectId(id));
    const filter: Record<string, unknown> = { _id: { $in: objectIds } };
    if (searchInput) {
      filter['name'] = { $regex: searchInput, $options: 'i' };
    }
    const repositories = await this.repositoryModel.find(filter);
    return repositories.map((r) => this.toRepositoryInfo(r));
  }

  async getRepository(repositoryId: string): Promise<RepositoryInfo> {
    const repository = await this.repositoryModel.findById(repositoryId);
    if (!repository) {
      throw new NotFoundException('Repository non trovata');
    }
    return this.toRepositoryInfo(repository);
  }

  async getBranches(repositoryId: string): Promise<string[]> {
    const repository = await this.repositoryModel.findById(repositoryId);
    if (!repository) {
      throw new NotFoundException('Repository non trovata');
    }
    return repository.branches;
  }

  async addRepository(dto: AddRepositoryDto): Promise<string> {
    const urlParts = dto.repositoryUrl
      .replace(/https?:\/\/github\.com\//, '')
      .split('/');
    const [ownerName, name] = urlParts;
    let repository = await this.repositoryModel.findOne({ ownerName, name });
    if (!repository) {
      repository = await this.repositoryModel.create({
        repoId: `${ownerName}/${name}`,
        ownerName,
        name,
        branches: [],
      });
    }
    return repository._id.toString();
  }

  // --- Metodi usati da altri moduli (workspaceRepository) ---

  async findById(id: string): Promise<RepositoryDocument> {
    const repository = await this.repositoryModel.findById(id);
    if (!repository) {
      throw new NotFoundException('Repository non trovata');
    }
    return repository;
  }

  async findOrCreate(ownerName: string, name: string): Promise<RepositoryDocument> {
    let repository = await this.repositoryModel.findOne({ ownerName, name });
    if (!repository) {
      repository = await this.repositoryModel.create({
        repoId: `${ownerName}/${name}`,
        ownerName,
        name,
        branches: [],
      });
    }
    return repository;
  }

  private toRepositoryInfo(r: RepositoryDocument): RepositoryInfo {
    return {
      repositoryId: r._id.toString(),
      repoId: r.repoId,
      ownerName: r.ownerName,
      name: r.name,
      branches: r.branches,
      dateScan: r.dateScan?.toISOString(),
      documentationScore: r.documentationScore,
      codeCoverage: r.codeCoverage,
      cvss: r.cvss,
    };
  }
}
