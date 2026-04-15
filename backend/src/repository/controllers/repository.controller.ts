import { Controller, Get, Inject, Param, UseGuards } from '@nestjs/common';
import type { IRepositoryService } from '../interfaces/repository.service.interface';
import { RepositoryServiceToken } from '../interfaces/repository.service.interface';
import { RepositoryResponseDto } from '../dtos/repository-response.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';

@ApiTags('repositories')
@ApiBearerAuth('access-token')
@Controller('repositories')
@UseGuards(JwtAuthGuard)
export class RepositoryController {
  constructor(
    @Inject(RepositoryServiceToken)
    private repositoryService: IRepositoryService,
  ) {}

  @ApiOperation({ summary: 'Dettaglio di un repository' })
  @ApiParam({ name: 'repositoryId', description: 'ID del repository' })
  @ApiResponse({ status: 200, description: 'Dati del repository', type: RepositoryResponseDto })
  @ApiResponse({ status: 404, description: 'Repository non trovato' })
  @Get(':repositoryId')
  async getRepository(
    @Param('repositoryId') repositoryId: string,
  ): Promise<RepositoryResponseDto> {
    const info = await this.repositoryService.getRepository(repositoryId);
    return { ...info };
  }

  @ApiOperation({ summary: 'Branch disponibili di un repository' })
  @ApiParam({ name: 'repositoryId', description: 'ID del repository' })
  @ApiResponse({ status: 200, description: 'Lista di branch', type: [String] })
  @ApiResponse({ status: 403, description: 'Accesso negato al repository' })
  @ApiResponse({ status: 404, description: 'Repository non trovato' })
  @Get(':repositoryId/branches')
  async getBranches(
    @Param('repositoryId') repositoryId: string,
  ): Promise<string[]> {
    return this.repositoryService.getBranches(repositoryId);
  }
}
