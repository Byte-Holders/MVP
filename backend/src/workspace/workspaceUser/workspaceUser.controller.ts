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
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

@UseGuards(JwtAuthGuard)
@Controller('workspaces')
export class WorkspaceUserController {
  constructor(
    @Inject(IWorkspaceUserServiceToken)
    private workspaceUserService: IWorkspaceUserService,
  ) {}

  @ApiOperation({ summary: 'Ottiene la lista degli utenti di un workspace' })
  @ApiParam({ name: 'workspaceId', description: 'ID del workspace' })
  @ApiResponse({
    status: 200,
    description: 'Lista degli utenti del workspace',
    type: [GetUsersOfWorkspaceResponseDto],
  })
  @Get(':workspaceId/users')
  async getUsersOfWorkspace(
    @Param('workspaceId') workspaceId: string,
  ): Promise<GetUsersOfWorkspaceResponseDto[]> {
    const users: GetUsersOfWorkspaceResponseDto[] =
      await this.workspaceUserService.getUsersOfWorkspace(workspaceId);
    return users;
  }

  @ApiOperation({ summary: 'Rimuove un utente da un workspace' })
  @ApiParam({ name: 'workspaceId', description: 'ID del workspace' })
  @ApiParam({ name: 'userId', description: "ID dell'utente" })
  @ApiResponse({ status: 200, description: 'Utente rimosso dal workspace' })
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
