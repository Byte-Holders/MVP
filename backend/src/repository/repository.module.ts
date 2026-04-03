import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Repository, RepositorySchema } from '../workspace/schemas/repository.schema';
import { RepositoryRepository } from './repository.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Repository.name, schema: RepositorySchema },
    ]),
  ],
  providers: [RepositoryRepository],
  exports: [RepositoryRepository],
})
export class RepositoryModule {}
