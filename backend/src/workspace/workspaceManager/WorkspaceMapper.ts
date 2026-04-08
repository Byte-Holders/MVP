import { CreateWorkspaceBo } from './types/CreateWorkspaceType';
import { MemberBo } from './types/MemberType';
import { WorkspaceBo } from './types/WorkspaceType';
import { CreateWorkspaceDto } from './dtos/CreateWorkspaceDto';
import { CreateWorkspaceResponseDto } from './dtos/CreateWorkspaceResponseDto';
import { WorkspaceResponseDto } from './dtos/WorkspaceResponseDto';
import type { RequestUser } from 'src/auth/types/requestUser.type'
import { WorkspaceDocument } from '../schemas/workspace.schema'
import {WorkspaceListItemBo} from './types/WorkspaceListItemType'

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
    dto.role   = bo.role
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
    bo.members = doc.members.map(m => {
      const member    = new MemberBo()
      member.userId   = m.userId
      member.username = m.userUsername
      member.role     = m.role
      return member
    })
    bo.ownerUsername = bo.members.find(m => m.userId === doc.ownerId)?.username ?? ''
    bo.repositoryIds = doc.repositories.map(r => r.repoId)
    return bo
  }

  // lista leggera senza dettagli completi: solo ownerUsername e nome del workspace
  static toListItemBo(doc: WorkspaceDocument, requesterId: string): WorkspaceListItemBo {
    const bo        = new WorkspaceListItemBo()
    bo.id           = doc._id.toString()
    bo.name         = doc.name
    bo.owner = doc.members.find(m => m.userId === doc.ownerId)?.userUsername ?? ''
    bo.role  = doc.members.find(m => m.userId === requesterId)?.role ?? 'viewer' // se non trova il membro, assegna ruolo viewer (caso raro, ma meglio gestirlo)
    return bo
  }
}
