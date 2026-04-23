import { Module } from '@nestjs/common';
import { WorkspaceManagerModule } from './workspaceManager/workspaceManager.module';
import { WorkspaceRepositoryModule } from './workspaceRepository/workspaceRepository.module';
import { WorkspaceUserModule } from './workspaceUser/workspaceUser.module';

@Module({
  imports: [
    WorkspaceManagerModule,
    WorkspaceRepositoryModule,
    WorkspaceUserModule,
  ],
})
export class WorkspaceModule {}
