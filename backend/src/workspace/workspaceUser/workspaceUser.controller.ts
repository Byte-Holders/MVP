import {
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  type IWorkspaceUserService,
  IWorkspaceUserServiceToken,
} from './interfaces/IWorkspaceUserService';
import { GetUsersOfWorkspaceResponseDto } from './dto/getUserOfWorkspace.responseDto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('workspace')
export class WorkspaceUserController {
  constructor(
    @Inject(IWorkspaceUserServiceToken)
    private workspaceUserService: IWorkspaceUserService,
  ) {}

  @Get(':workspaceId/users')
  async getUsersOfWorkspace(@Param('workspaceId') workspaceId: string) {
    const users: GetUsersOfWorkspaceResponseDto[] =
      await this.workspaceUserService.getUsersOfWorkspace(workspaceId);
    return users;
  }

  @Delete(':workspaceId/users/:userId')
  async removeUserFromWorkspace(
    @Param('workspaceId') workspaceId: string,
    @Param('userId') userId: string,
  ) {
    await this.workspaceUserService.removeUserFromWorkspace(
      workspaceId,
      userId,
    );
  }
}
