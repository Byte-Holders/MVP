import { Module } from '@nestjs/common';
import { WorkspaceController } from './workspace.controller';
import { WorkspaceService } from './workspace.service';
import { WorkspaceRepository } from './workspace.repository';
import { Workspace, WorkspaceSchema } from './schemas/workspace.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { WorkspaceManagerModule } from './workspaceManager/workspaceManager.module';
import { WorkspaceRepositoryModule } from './workspaceRepository/workspaceRepository.module';
import { WorkspaceUserModule } from './workspaceUser/workspaceUser.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Workspace.name, schema: WorkspaceSchema },
    ]),
    WorkspaceManagerModule,
    WorkspaceRepositoryModule,
    WorkspaceUserModule,
  ],
  controllers: [WorkspaceController],
  providers: [WorkspaceService, WorkspaceRepository],
})
export class WorkspaceModule {}
