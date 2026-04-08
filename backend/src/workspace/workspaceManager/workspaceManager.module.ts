import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WorkspaceManagerController } from './workspaceManager.controller';
import { WorkspaceManagerService } from './workspaceManager.service';
import { WorkspaceManagerRepository } from './workspaceManager.repository';
import { Workspace, WorkspaceSchema } from '../schemas/workspace.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Workspace.name, schema: WorkspaceSchema },
    ]),
  ],
  controllers: [WorkspaceManagerController],
  //providers: [WorkspaceManagerService, WorkspaceManagerRepository],
  providers: [
    {
      provide: 'IWorkspaceManagerService', // token che usa il controller
      useClass: WorkspaceManagerService,
    },
    {
      provide: 'IWorkspaceManagerRepository', // token che usa il service
      useClass: WorkspaceManagerRepository,
    },
  ],
  exports: [
    'IWorkspaceManagerService', // esportato per altri moduli che lo iniettano
  ],
})
export class WorkspaceManagerModule {}
