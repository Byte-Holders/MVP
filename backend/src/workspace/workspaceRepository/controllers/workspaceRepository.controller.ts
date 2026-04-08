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
import { AddRepositoryDto } from '../../../repository/dtos/add-repository.dto';
import { AccessTokenDto } from '../dtos/access-token.dto';
import { GetRepositoriesQueryDto } from '../dtos/get-repositories-query.dto';
import { RepositoryResponseDto } from '../../../repository/dtos/repository-response.dto';
import type { IWorkspaceRepositoryService } from '../interfaces/workspaceRepository.service.interface';
import { WorkspaceRepositoryServiceToken } from '../interfaces/workspaceRepository.service.interface';

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
    @Query() query: GetRepositoriesQueryDto,
  ): Promise<RepositoryResponseDto[]> {
    const repositories = await this.workspaceRepositoryService.getRepositories(
      workspaceId,
      query.searchInput,
    );
    return repositories.map((r) => ({ ...r }));
  }

  @Post()
  async addRepository(
    @Param('workspaceId') workspaceId: string,
    @Body() dto: AddRepositoryDto,
  ): Promise<void> {
    return this.workspaceRepositoryService.addRepository(
      workspaceId,
      dto.repositoryUrl,
      dto.accessToken,
    );
  }

  @Delete(':repositoryId')
  async removeRepository(
    @Param('workspaceId') workspaceId: string,
    @Param('repositoryId') repositoryId: string,
  ): Promise<void> {
    return this.workspaceRepositoryService.removeRepository(
      repositoryId,
      workspaceId,
    );
  }

  @Patch(':repositoryId')
  async updateToken(
    @Param('workspaceId') workspaceId: string,
    @Param('repositoryId') repositoryId: string,
    @Body() dto: AccessTokenDto,
  ): Promise<void> {
    return this.workspaceRepositoryService.updateToken(
      repositoryId,
      workspaceId,
      dto.accessToken,
    );
  }
}
