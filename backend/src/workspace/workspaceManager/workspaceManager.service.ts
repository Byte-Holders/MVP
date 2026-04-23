import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateWorkspaceDto } from './dtos/CreateWorkspaceDto';
import type { IWorkspaceManagerRepository } from './interfaces/workspaceManager.repository.interface';
import type { IWorkspaceManagerService } from './interfaces/workspaceManager.service.interface';
import { CreateWorkspaceResponseDto } from './dtos/CreateWorkspaceResponseDto';
import { CreateWorkspaceBo } from './types/CreateWorkspaceType';
import { WorkspaceBo } from './types/WorkspaceType';
import { CreateWorkspaceData } from './entity/CreateWorkspaceData';
import { WorkspaceDocumentMapper } from './WorkspaceMapper';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { WorkspaceRole } from '../roles.enum';
import { ConflictException } from '@nestjs/common';
import { WorkspaceListItemBo } from './types/WorkspaceListItemType';

@Injectable()
export class WorkspaceManagerService implements IWorkspaceManagerService {
  constructor(
    @Inject('IWorkspaceManagerRepository')
    private readonly repository: IWorkspaceManagerRepository,
  ) {}

  async createWorkspace(data: CreateWorkspaceBo): Promise<WorkspaceBo> {
    try {
      // LOGICA DI BUSINESS — il service costruisce il documento completo
      const docData: CreateWorkspaceData = {
        name: data.name,
        ownerId: data.ownerId,
        ownerUsername: data.ownerUsername,
        creationDate: new Date(), // ← generata dal service
        initialMembers: [
          {
            // ← costruita dal service
            userId: data.ownerId,
            userUsername: data.ownerUsername,
            role: WorkspaceRole.PROJECT_MANAGER,
          },
        ],
      };

      // Repository riceve solo dati strutturati, non BO
      const doc = await this.repository.create(docData);

      // DocumentMapper converte il Document in BO prima di tornare al controller
      return WorkspaceDocumentMapper.toBO(doc);
    } catch (error: any) {
      // MongoDB duplicate key error
      if (error?.code === 11000) {
        throw new ConflictException( //NestJS converte automaticamente ConflictException in una risposta HTTP 409
          `Hai già un workspace chiamato "${data.name}"`,
        );
      }
      throw error; // rilancia errori non gestiti
    }
  }

  async deleteWorkspace(
    workspaceId: string,
    requesterId: string,
  ): Promise<void> {
    const workspace = await this.repository.findById(workspaceId);
    if (!workspace) throw new NotFoundException('Workspace non trovato');

    // LOGICA DI BUSINESS — solo l'owner può cancellare
    if (workspace.ownerId !== requesterId) {
      throw new ForbiddenException(
        'Solo il proprietario può cancellare il workspace',
      );
    }

    await this.repository.delete(workspaceId);
  }
  async getWorkspaces(userId: string): Promise<WorkspaceListItemBo[]> {
    const docs = await this.repository.findByMemberId(userId);
    return docs.map((doc) => WorkspaceDocumentMapper.toListItemBo(doc, userId));
  }
}
