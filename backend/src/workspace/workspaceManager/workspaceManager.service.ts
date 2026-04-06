import { Inject, Injectable, UnauthorizedException } from '@nestjs/common'
import { CreateWorkspaceDto } from './dto/CreateWorkspaceDto'
import type { IWorkspaceManagerRepository } from './interfaces/workspaceManager.repository.interface'
import type { IWorkspaceManagerService } from './interfaces/workspaceManager.service.interface'
import { CreateWorkspaceResponseDto } from './dto/CreateWorkspaceResponseDto'

@Injectable()
export class WorkspaceManagerService implements IWorkspaceManagerService {
  constructor(
    @Inject('IWorkspaceManagerRepository')
    private readonly repository: IWorkspaceManagerRepository
  ) {}

  async createWorkspace(dto: CreateWorkspaceDto, ownerUsername: string, ownerSub: string): Promise<CreateWorkspaceResponseDto>  {
    // verifica che chi chiama sia davvero chi dice di essere
    /*if (dto.createdBy !== authenticatedUsername) {
      throw new UnauthorizedException('Username non corrisponde al token')
    }
    return this.repository.create(dto, ownerSub)*/
    console.log('SERVICE createWorkspace chiamato') 
    const workspace = await this.repository.create(dto, ownerSub)
    console.log('workspace salvato:', workspace) 

    // mappa il documento Mongoose nel DTO di risposta
    const response = new CreateWorkspaceResponseDto()
    response.id = workspace._id.toString()  // _id di MongoDB → stringa
    response.name = workspace.name
    response.createdBy = ownerUsername

    return response
  }

  async deleteWorkspace(id: string): Promise<void> { //da ricontrollare nel caso in cui una repo appartenga solo al workpace che viene eliminato, si eliminano anche quei dati?
    return this.repository.delete(id)
  }
}