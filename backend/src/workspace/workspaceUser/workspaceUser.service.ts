import { Inject, Injectable } from "@nestjs/common";
import { IAddUserToWorkspace } from "./interfaces/IAddUserToWorkspace.interface";
import { IWorkspaceUserService } from "./interfaces/IWorkspaceUserService";
import { type IWorkspaceUserRepository, IWorkspaceUserRepositoryToken } from "./interfaces/IWorkspaceUserRepository.interface";
import { UserOfWorkspaceInfo } from "./type/userOfWorkspace.type";

@Injectable()
export class WorkspaceUserService implements IWorkspaceUserService, IAddUserToWorkspace {
    constructor(
        @Inject(IWorkspaceUserRepositoryToken) private workspaceUserRepository: IWorkspaceUserRepository,
    ) {}

    async getUsersOfWorkspace(workspaceId: string) {
        return this.workspaceUserRepository.getUsersOfWorkspace(workspaceId);
    }

    async removeUserFromWorkspace(workspaceId: string, userId: string) {
        await this.workspaceUserRepository.removeUserFromWorkspace(workspaceId, userId);
    }

    async addUserToWorkspace(user: UserOfWorkspaceInfo, workspaceId: string) {
        await this.workspaceUserRepository.addUserToWorkspace(user, workspaceId);
    }
}