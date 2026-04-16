import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Workspace, WorkspaceSchema } from '../schemas/workspace.schema';
import { WorkspaceUserController } from './workspaceUser.controller';
import { WorkspaceUserRepository } from './workspaceUser.repository';
import { WorkspaceUserService } from './workspaceUser.service';
import { IWorkspaceUserRepositoryToken } from './interfaces/IWorkspaceUserRepository.interface';
import { IWorkspaceUserServiceToken } from './interfaces/IWorkspaceUserService';
import { IAddUserToWorkspaceToken } from './interfaces/IAddUserToWorkspace.interface';
import { IUserRoleReaderToken } from './interfaces/IUserRoleReader';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Workspace.name, schema: WorkspaceSchema },
    ]),
  ],
  controllers: [WorkspaceUserController],
  providers: [
    {
      provide: IWorkspaceUserServiceToken,
      useClass: WorkspaceUserService,
    },
    {
      provide: IWorkspaceUserRepositoryToken,
      useClass: WorkspaceUserRepository,
    },
    {
      provide: IAddUserToWorkspaceToken,
      useClass: WorkspaceUserService,
    },
    {
      provide: IUserRoleReaderToken,
      useClass: WorkspaceUserService,
    },
  ],
  exports: [
    IWorkspaceUserServiceToken,
    IAddUserToWorkspaceToken,
    IUserRoleReaderToken,
  ],
})
export class WorkspaceUserModule {}
