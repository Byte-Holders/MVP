import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Repository,
  RepositorySchema,
} from '../workspace/schemas/repository.schema';
import { RepositoryRepository } from './repository.repository';
import { GitHubRepository } from './github.repository';
import { RepositoryService } from './services/repository.service';
import { RepositoryController } from './controllers/repository.controller';
import { RepositoryServiceToken } from './interfaces/repository.service.interface';
import { RepositoryRepositoryToken } from './interfaces/repository.repository.interface';
import { RepositoryReaderToken } from './interfaces/repository.reader.interface';
import { RepositoryWriterToken } from './interfaces/repository.writer.interface';
import { GitHubRepositoryToken } from './interfaces/github.repository.interface';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Repository.name, schema: RepositorySchema },
    ]),
  ],
  controllers: [RepositoryController],
  providers: [
    {
      provide: RepositoryRepositoryToken,
      useClass: RepositoryRepository,
    },
    {
      provide: GitHubRepositoryToken,
      useClass: GitHubRepository,
    },
    {
      provide: RepositoryServiceToken,
      useClass: RepositoryService,
    },
    {
      provide: RepositoryReaderToken,
      useClass: RepositoryService,
    },
    {
      provide: RepositoryWriterToken,
      useClass: RepositoryService,
    },
  ],
  exports: [RepositoryReaderToken, RepositoryWriterToken],
})
export class RepositoryModule {}
