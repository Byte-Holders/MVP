import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Workspace } from './schemas/workspace.schema';
import { Model } from 'mongoose';
import { CreateWorkspaceDto } from './dtos/CreateWorkspaceDto';

@Injectable()
export class WorkspaceRepository {
    constructor(@InjectModel(Workspace.name) private workspaceModel: Model<Workspace>) {}

    async createWorkspace(createWorkspaceDto: CreateWorkspaceDto, ownerId: string) {
        console.log("Creating workspace with name:", createWorkspaceDto.name, "and ownerId:", ownerId);
        const workspace = new this.workspaceModel({ name: createWorkspaceDto.name, ownerId: ownerId, creationDate: new Date() });
        return workspace.save();
    }
}