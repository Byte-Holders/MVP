import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Workspace } from '../schemas/workspace.schema'
import { CreateWorkspaceDto } from './dto/CreateWorkspaceDto'
import type { IWorkspaceManagerRepository } from './interfaces/workspaceManager.repository.interface'

// workspace-manager.repository.ts — implementa l'interfaccia
@Injectable()
export class WorkspaceManagerRepository implements IWorkspaceManagerRepository {
  constructor(
    @InjectModel(Workspace.name) private workspaceModel: Model<Workspace>
  ) {}

  async create(dto: CreateWorkspaceDto, authenticatedUsername: string): Promise<Workspace> {
    console.log(
      'Creating workspace with name:',
      dto.name,
      'and ownerId:',
      authenticatedUsername,
    );
    const workspace = new this.workspaceModel({
      name: dto.name,
      owner: authenticatedUsername,
    })
    return workspace.save()
  }

  async delete(id: string): Promise<void> {
    await this.workspaceModel.findByIdAndDelete(id)
  }

  async findByOwner(username: string): Promise<Workspace[]> {
    return this.workspaceModel.find({ owner: username }).exec()
  }
}