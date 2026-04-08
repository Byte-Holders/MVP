import { Controller, Get, Inject, Param } from '@nestjs/common';
import type { IRepositoryService } from '../interfaces/repository.service.interface';
import { RepositoryServiceToken } from '../interfaces/repository.service.interface';
import { RepositoryResponseDto } from '../dtos/repository-response.dto';

@Controller('repository')
export class RepositoryController {
  constructor(
    @Inject(RepositoryServiceToken)
    private repositoryService: IRepositoryService,
  ) {}

  @Get(':repositoryId')
  async getRepository(@Param('repositoryId') repositoryId: string): Promise<RepositoryResponseDto> {
    const info = await this.repositoryService.getRepository(repositoryId);
    return { ...info };
  }

  @Get(':repositoryId/branches')
  async getBranches(@Param('repositoryId') repositoryId: string): Promise<string[]> {
    return this.repositoryService.getBranches(repositoryId);
  }
}
