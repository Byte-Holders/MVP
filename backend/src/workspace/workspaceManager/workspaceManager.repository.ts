import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { HydratedDocument, Model } from 'mongoose'
import { Workspace, WorkspaceDocument } from '../schemas/workspace.schema'
import { CreateWorkspaceDto } from './dto/CreateWorkspaceDto'
import type { IWorkspaceManagerRepository } from './interfaces/workspaceManager.repository.interface'
import { CreateWorkspaceData } from './document/CreateWorkspaceData'

@Injectable()
export class WorkspaceManagerRepository implements IWorkspaceManagerRepository {
  constructor(
    @InjectModel(Workspace.name)
    private readonly workspaceModel: Model<WorkspaceDocument>
  ) {}

  async create(data: CreateWorkspaceData):Promise<HydratedDocument<Workspace>> {
    // Il repository costruisce il Document dal tipo di dati che gli appartiene
    // Non conosce BO, non conosce DTO
    console.log('Repository riceve questi dati per creare il workspace:', data) // log per debug
    const workspace = new this.workspaceModel({
      name: data.name,
      ownerId: data.ownerId,
      creationDate: data.creationDate,
      members: data.initialMembers.map(m => ({  // array con l'owner già inserito
        userId: m.userId,
        userUsername: m.userUsername,
        role: m.role
      })),
      repositories: []  // array vuoto — nessuna repo al momento della creazione
    })
    console.log('Repository: documento costruito:', JSON.stringify(workspace.toObject()))
  console.log('Repository: errori di validazione:', workspace.validateSync())
    //return workspace.save()
    try {
    const saved = await workspace.save()
    console.log('Repository: save completato:', saved._id)
    return saved
  } catch (err) {
    console.error('Repository: save fallito con errore:', err)
    throw err
  }
  }

  async delete(workspaceId: string): Promise<void> {
    await this.workspaceModel.findByIdAndDelete(workspaceId)
  }

  async findById(workspaceId: string): Promise<HydratedDocument<Workspace>  | null> {
    return this.workspaceModel.findById(workspaceId).exec()
  }

  async findByMemberId(userId: string): Promise<HydratedDocument<Workspace>[]> {
  // cerca tutti i workspace dove l'array members contiene un elemento con quel userId
  return this.workspaceModel.find({ 'members.userId': userId }).exec()
}
}