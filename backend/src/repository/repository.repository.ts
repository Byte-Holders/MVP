import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Repository,
  RepositoryDocument,
} from '../workspace/schemas/repository.schema';

@Injectable()
export class RepositoryRepository {
  constructor(
    @InjectModel(Repository.name) private repositoryModel: Model<Repository>,
  ) {}

  async findOrCreate(
    ownerName: string,
    name: string,
  ): Promise<RepositoryDocument> {
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
}
