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
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AddRepositoryDto } from '../../../repository/dtos/add-repository.dto';
import { AccessTokenDto } from '../dtos/access-token.dto';
import { GetRepositoriesQueryDto } from '../dtos/get-repositories-query.dto';
import { RepositoryResponseDto } from '../../../repository/dtos/repository-response.dto';
import type { IWorkspaceRepositoryService } from '../interfaces/workspaceRepository.service.interface';
import { WorkspaceRepositoryServiceToken } from '../interfaces/workspaceRepository.service.interface';
import { JwtAuthGuard } from '../../../auth/jwt-auth.guard';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('workspace-repositories')
@ApiBearerAuth('access-token')
@Controller('workspaces/:workspaceId/repositories')
@UseGuards(JwtAuthGuard)
@UsePipes(new ValidationPipe())
export class WorkspaceRepositoryController {
  constructor(
    @Inject(WorkspaceRepositoryServiceToken)
    private workspaceRepositoryService: IWorkspaceRepositoryService,
  ) {}

  @ApiOperation({ summary: 'Lista repository del workspace' })
  @ApiParam({ name: 'workspaceId', description: 'ID del workspace' })
  @ApiQuery({ name: 'searchInput', required: false, description: 'Filtra per nome repository' })
  @ApiResponse({ status: 200, description: 'Lista repository', type: [RepositoryResponseDto] })
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

  @ApiOperation({ summary: 'Aggiungi un repository al workspace' })
  @ApiParam({ name: 'workspaceId', description: 'ID del workspace' })
  @ApiResponse({ status: 201, description: 'Repository aggiunto' })
  @ApiResponse({ status: 400, description: 'URL non valido o token GitHub non valido' })
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

  @ApiOperation({ summary: 'Rimuovi un repository dal workspace' })
  @ApiParam({ name: 'workspaceId', description: 'ID del workspace' })
  @ApiParam({ name: 'repositoryId', description: 'ID del repository' })
  @ApiResponse({ status: 200, description: 'Repository rimosso' })
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

  @ApiOperation({ summary: 'Aggiorna il token GitHub di un repository' })
  @ApiParam({ name: 'workspaceId', description: 'ID del workspace' })
  @ApiParam({ name: 'repositoryId', description: 'ID del repository' })
  @ApiResponse({ status: 200, description: 'Token aggiornato' })
  @ApiResponse({ status: 400, description: 'Token GitHub non valido' })
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
