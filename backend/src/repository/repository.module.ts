import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Repository, RepositorySchema } from './schemas/repository.schema';
import { RepositoryRepository } from './repositories/repository.repository';
import { GitHubRepository } from './repositories/github.repository';
import { RepositoryService } from './services/repository.service';
import { RepositoryReaderService } from './services/repository-reader.service';
import { RepositoryWriterService } from './services/repository-writer.service';
import { RepositoryScoreService } from './services/repository-score.service';
import { RepositoryController } from './controllers/repository.controller';
import { RepositoryServiceToken } from './interfaces/repository.service.interface';
import { RepositoryFindRepositoryToken } from './interfaces/repository.find-repository.interface';
import { RepositoryPersistRepositoryToken } from './interfaces/repository.persist-repository.interface';
import { RepositoryScoreRepositoryToken } from './interfaces/repository.score-repository.interface';
import { RepositoryReaderToken } from './interfaces/repository.reader.interface';
import { RepositoryWriterToken } from './interfaces/repository.writer.interface';
import { RepositoryScoreWriterToken } from './interfaces/repository.score-writer.interface';
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
      provide: RepositoryFindRepositoryToken,
      useClass: RepositoryRepository,
    },
    {
      provide: RepositoryPersistRepositoryToken,
      useClass: RepositoryRepository,
    },
    {
      provide: RepositoryScoreRepositoryToken,
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
      useClass: RepositoryReaderService,
    },
    {
      provide: RepositoryWriterToken,
      useClass: RepositoryWriterService,
    },
    {
      provide: RepositoryScoreWriterToken,
      useClass: RepositoryScoreService,
    },
  ],
  exports: [RepositoryReaderToken, RepositoryWriterToken, RepositoryScoreWriterToken],
})
export class RepositoryModule {}
