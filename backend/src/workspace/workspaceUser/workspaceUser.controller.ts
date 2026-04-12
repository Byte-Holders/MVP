import { Controller, Delete, Get, Inject, Param, Post } from "@nestjs/common";
import { WorkspaceUserRepository } from "./workspaceUser.repository";
import { WorkspaceRole } from "../roles.enum";
import { type IWorkspaceUserService, IWorkspaceUserServiceToken } from "./interfaces/IWorkspaceUserService";
import { IWorkspaceUserRepositoryToken } from "./interfaces/IWorkspaceUserRepository.interface";
import { GetUsersOfWorkspaceResponseDto } from "./dto/getUserOfWorkspace.responseDto";

@Controller('workspace')
export class WorkspaceUserController {
    constructor(
        @Inject(IWorkspaceUserServiceToken) private workspaceUserService: IWorkspaceUserService,
        @Inject(IWorkspaceUserRepositoryToken) private workspaceUserRepository: WorkspaceUserRepository
    ) {}

    @Get(':workspaceId/users')
    async getUsersOfWorkspace(@Param('workspaceId') workspaceId: string) {
        const users: GetUsersOfWorkspaceResponseDto[] = await this.workspaceUserService.getUsersOfWorkspace(workspaceId);
        return users;
    }

    @Delete(':workspaceId/users/:userId')
    async removeUserFromWorkspace(@Param('workspaceId') workspaceId: string, @Param('userId') userId: string) {
        await this.workspaceUserService.removeUserFromWorkspace(workspaceId, userId);
    }
}