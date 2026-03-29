import { Injectable } from '@nestjs/common';
import { CreateWorkspaceDto } from './dtos/CreateWorkspaceDto';
import { WorkspaceRepository } from './workspace.repository';

@Injectable()
export class WorkspaceService {
    constructor(private workspaceRepository: WorkspaceRepository) {}

    async createWorkspace(createWorkspaceDto: CreateWorkspaceDto, ownerId: string) {
        return this.workspaceRepository.createWorkspace(createWorkspaceDto, ownerId);
    }

}
