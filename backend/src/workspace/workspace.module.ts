import { Module } from '@nestjs/common';
import { WorkspaceController } from './workspace.controller';
import { WorkspaceService } from './workspace.service';
import { WorkspaceRepository } from './workspace.repository';
import { Workspace, WorkspaceSchema } from './schemas/workspace.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [MongooseModule.forFeature([{ name: Workspace.name, schema: WorkspaceSchema }])],
  controllers: [WorkspaceController],
  providers: [WorkspaceService, WorkspaceRepository]
})
export class WorkspaceModule {}
