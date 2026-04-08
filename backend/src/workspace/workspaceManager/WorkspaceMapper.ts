import { CreateWorkspaceBo } from './bo/CreateWorkspaceBo';
import { MemberBo } from './bo/MemberBo';
import { WorkspaceBo } from './bo/WorkspaceBo';
import { CreateWorkspaceDto } from './dto/CreateWorkspaceDto';
import { CreateWorkspaceResponseDto } from './dto/CreateWorkspaceResponseDto';
import { WorkspaceResponseDto } from './dto/WorkspaceResponseDto';
import type { RequestUser } from 'src/auth/types/requestUser.type'
import { WorkspaceDocument } from '../schemas/workspace.schema'
import {WorkspaceListItemBo} from './bo/WorkspaceListItemBo'

// WorkspaceMapper.ts — tra Controller e Service
export class WorkspaceMapper {

  // DTO + RequestUser → CreateWorkspaceBO
  static toCreateBO(dto: CreateWorkspaceDto, user: RequestUser): CreateWorkspaceBo {
    const bo = new CreateWorkspaceBo()
    bo.name = dto.name
    bo.ownerId = user.userId
    bo.ownerUsername = user.username
    return bo
  }

  // WorkspaceBO → CreateWorkspaceResponseDto
  static toCreateResponseDto(bo: WorkspaceBo): CreateWorkspaceResponseDto {
    const dto = new CreateWorkspaceResponseDto()
    dto.id = bo.id
    dto.name = bo.name
    dto.ownerUsername = bo.ownerUsername  // restituisce username, non id
    return dto
  }

  // nuovo — per la lista
  static toListItemDto(bo: WorkspaceListItemBo): WorkspaceResponseDto {
    const dto          = new WorkspaceResponseDto()
    dto.id             = bo.id
    dto.name           = bo.name
    dto.owner  = bo.owner
    return dto
  }
}

// WorkspaceDocumentMapper.ts — tra Repository e Service
export class WorkspaceDocumentMapper {

  static toBO(doc: WorkspaceDocument): WorkspaceBo {
    const bo = new WorkspaceBo()
    bo.id           = doc._id.toString()  // ObjectId → string, ok
    bo.name         = doc.name
    bo.ownerId      = doc.ownerId
    bo.creationDate = doc.creationDate
    bo.ownerUsername = doc.members.find(m => m.userId === doc.ownerId)?.userUsername ?? ''
    bo.members = doc.members.map(m => {
      const member    = new MemberBo()
      member.userId   = m.userId
      member.username = m.userUsername
      member.role     = m.role
      return member
    })
    bo.repositoryIds = doc.repositories.map(r => r.repoId)
    return bo
  }

  // lista leggera senza dettagli completi: solo ownerUsername e nome del workspace
  static toListItemBo(doc: WorkspaceDocument, requesterId: string): WorkspaceListItemBo {
    const bo        = new WorkspaceListItemBo()
    bo.id           = doc._id.toString()
    bo.name         = doc.name
    bo.owner = doc.members.find(m => m.userId === doc.ownerId)?.userUsername ?? ''
    return bo
  }
}
