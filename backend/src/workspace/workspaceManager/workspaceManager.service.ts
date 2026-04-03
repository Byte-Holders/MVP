import { Inject, Injectable, UnauthorizedException } from '@nestjs/common'
import { CreateWorkspaceDto } from './dto/CreateWorkspaceDto'
import type { IWorkspaceManagerRepository } from './interfaces/workspaceManager.repository.interface'
import type { IWorkspaceManagerService } from './interfaces/workspaceManager.service.interface'

@Injectable()
export class WorkspaceManagerService implements IWorkspaceManagerService {
  constructor(
    @Inject('IWorkspaceManagerRepository')
    private readonly repository: IWorkspaceManagerRepository
  ) {}

  async createWorkspace(dto: CreateWorkspaceDto, authenticatedUsername: string) {
    // verifica che chi chiama sia davvero chi dice di essere
    if (dto.createdBy !== authenticatedUsername) {
      throw new UnauthorizedException('Username non corrisponde al token')
    }
    return this.repository.create(dto)
  }
}