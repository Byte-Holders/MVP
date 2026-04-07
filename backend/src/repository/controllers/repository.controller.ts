import { Controller, Get, Inject, Param } from '@nestjs/common';
import type { IRepositoryService } from '../interfaces/repository.service.interface';
import { RepositoryServiceToken } from '../interfaces/repository.service.interface';
import type { RepositoryInfo } from '../types/repository-info';

@Controller('repository')
export class RepositoryController {
  constructor(
    @Inject(RepositoryServiceToken)
    private repositoryService: IRepositoryService,
  ) {}

  @Get(':repositoryId')
  async getRepository(@Param('repositoryId') repositoryId: string): Promise<RepositoryInfo> {
    return this.repositoryService.getRepository(repositoryId);
  }

  @Get(':repositoryId/branches')
  async getBranches(@Param('repositoryId') repositoryId: string): Promise<string[]> {
    return this.repositoryService.getBranches(repositoryId);
  }
}
