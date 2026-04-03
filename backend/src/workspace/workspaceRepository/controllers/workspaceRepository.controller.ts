import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import type { RepositoryResponseDto } from '../dtos/RepositoryResponseDto';
import { AddRepositoryDto } from '../dtos/AddRepositoryDto';
import { GetRepositoriesDto } from '../dtos/GetRepositoriesDto';
import { AccessTokenDto } from '../dtos/AccessTokenDto';
import { WorkspaceRepoParamsDto } from '../dtos/WorkspaceRepoParamsDto';
import type { IWorkspaceRepositoryService } from '../interfaces/workspaceRepository.service.interface';
import { WorkspaceRepositoryServiceToken } from '../interfaces/workspaceRepository.service.interface';

@Controller('workspace-repository')
export class WorkspaceRepositoryController {
  constructor(
    @Inject(WorkspaceRepositoryServiceToken)
    private workspaceRepositoryService: IWorkspaceRepositoryService,
  ) {}

  @Get(':workspaceId')
  @UsePipes(new ValidationPipe())
  async getRepositories(
    @Param() dto: GetRepositoriesDto,
  ): Promise<RepositoryResponseDto[]> {
    return this.workspaceRepositoryService.getRepositories(dto);
  }

  @Post()
  @UsePipes(new ValidationPipe())
  async addRepository(@Body() dto: AddRepositoryDto): Promise<void> {
    return this.workspaceRepositoryService.addRepository(dto);
  }

  @Delete(':workspaceId/:repoId')
  @UsePipes(new ValidationPipe())
  async removeRepository(
    @Param() params: WorkspaceRepoParamsDto,
  ): Promise<void> {
    return this.workspaceRepositoryService.removeRepository(params);
  }

  @Patch(':workspaceId/:repoId')
  @UsePipes(new ValidationPipe())
  async updateToken(
    @Param() params: WorkspaceRepoParamsDto,
    @Body() dto: AccessTokenDto,
  ): Promise<void> {
    return this.workspaceRepositoryService.updateToken(params, dto);
  }
}
