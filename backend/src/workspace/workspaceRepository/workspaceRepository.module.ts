import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Workspace, WorkspaceSchema } from '../schemas/workspace.schema';
import { WorkspaceRepositoryController } from './controllers/workspaceRepository.controller';
import { WorkspaceRepositoryService } from './services/workspaceRepository.service';
import { WorkspaceRepositoryRepository } from './workspaceRepository.repository';
import { WorkspaceRepositoryServiceToken } from './interfaces/workspaceRepository.service.interface';
import { WorkspaceRepositoryToken } from './interfaces/workspaceRepository.repository.interface';
import { RepositoryModule } from '../../repository/repository.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Workspace.name, schema: WorkspaceSchema }]),
    RepositoryModule,
  ],
  controllers: [WorkspaceRepositoryController],
  providers: [
    {
      provide: WorkspaceRepositoryServiceToken,
      useClass: WorkspaceRepositoryService,
    },
    {
      provide: WorkspaceRepositoryToken,
      useClass: WorkspaceRepositoryRepository,
    },
  ],
})
export class WorkspaceRepositoryModule {}
