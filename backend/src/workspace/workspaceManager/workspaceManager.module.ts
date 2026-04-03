import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { WorkspaceManagerController } from './workspaceManager.controller'
import { WorkspaceManagerService } from './workspaceManager.service'
import { WorkspaceManagerRepository } from './workspaceManager.repository'
import { Workspace, WorkspaceSchema } from '../schemas/workspace.schema'

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Workspace.name, schema: WorkspaceSchema }])
  ],
  controllers: [WorkspaceManagerController],
  //providers: [WorkspaceManagerService, WorkspaceManagerRepository],
  providers: [
    {
      provide: 'IWorkspaceManagerRepository',  // token stringa
      useClass: WorkspaceManagerRepository,     // implementazione concreta
    },
    WorkspaceManagerService,
  ],
})
export class WorkspaceManagerModule {}