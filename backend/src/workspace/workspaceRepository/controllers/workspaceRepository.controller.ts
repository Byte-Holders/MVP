import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AddRepositoryDto } from '../../../repository/dtos/AddRepositoryDto';
import { AccessTokenDto } from '../dtos/AccessTokenDto';
import type { IWorkspaceRepositoryService } from '../interfaces/workspaceRepository.service.interface';
import { WorkspaceRepositoryServiceToken } from '../interfaces/workspaceRepository.service.interface';
import type { RepositoryInfo } from '../../../repository/dtos/RepositoryInfo';

@Controller('workspaces/:workspaceId/repositories')
@UsePipes(new ValidationPipe())
export class WorkspaceRepositoryController {
  constructor(
    @Inject(WorkspaceRepositoryServiceToken)
    private workspaceRepositoryService: IWorkspaceRepositoryService,
  ) {}

  @Get()
  async getRepositories(
    @Param('workspaceId') workspaceId: string,
    @Query('searchInput') searchInput?: string,
  ): Promise<RepositoryInfo[]> {
    return this.workspaceRepositoryService.getRepositories(workspaceId, searchInput);
  }

  @Post()
  async addRepository(
    @Param('workspaceId') workspaceId: string,
    @Body() dto: AddRepositoryDto,
  ): Promise<void> {
    return this.workspaceRepositoryService.addRepository(workspaceId, dto);
  }

  @Delete(':repositoryId')
  async removeRepository(
    @Param('workspaceId') workspaceId: string,
    @Param('repositoryId') repositoryId: string,
  ): Promise<void> {
    return this.workspaceRepositoryService.removeRepository(repositoryId, workspaceId);
  }

  @Patch(':repositoryId')
  async updateToken(
    @Param('workspaceId') workspaceId: string,
    @Param('repositoryId') repositoryId: string,
    @Body() dto: AccessTokenDto,
  ): Promise<void> {
    return this.workspaceRepositoryService.updateToken(repositoryId, workspaceId, dto);
  }
}
