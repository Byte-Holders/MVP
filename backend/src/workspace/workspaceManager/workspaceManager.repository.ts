import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Workspace, WorkspaceDocument } from '../schemas/workspace.schema'
import { CreateWorkspaceDto } from './dto/CreateWorkspaceDto'
import type { IWorkspaceManagerRepository } from './interfaces/workspaceManager.repository.interface'

// workspace-manager.repository.ts — implementa l'interfaccia
@Injectable()
export class WorkspaceManagerRepository implements IWorkspaceManagerRepository {
  constructor(
    @InjectModel(Workspace.name) private workspaceModel: Model<Workspace>
  ) {}

  async create(dto: CreateWorkspaceDto, ownerSub: string): Promise<WorkspaceDocument> {
    console.log(
      'Creating workspace with name:',
      dto.name,
      'and ownerSub:',
      ownerSub,
      'and date:',
      new Date(),
    );
    const workspace = new this.workspaceModel({
      name: dto.name,
      ownerSub: ownerSub,
      creationDate: new Date(),
    })
    return workspace.save()
  }

  async delete(id: string): Promise<void> {
    await this.workspaceModel.findByIdAndDelete(id)
  }

  async findByOwner(sub: string): Promise<Workspace[]> {
    return this.workspaceModel.find({ ownerSub: sub }).exec()
  }
}