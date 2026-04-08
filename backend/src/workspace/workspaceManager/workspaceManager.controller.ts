import { Body, Controller, Post, UseGuards, Req, Delete, Param, Get } from '@nestjs/common'
import  type { IWorkspaceManagerService } from './interfaces/workspaceManager.service.interface'
import { CreateWorkspaceDto } from './dtos/CreateWorkspaceDto'
import { JwtAuthGuard } from '../../auth/jwt-auth.guard'  // vedi sotto
import { CreateWorkspaceResponseDto } from './dtos/CreateWorkspaceResponseDto'
import { Request } from 'supertest'
import { User } from 'src/auth/customDecorators/user.decorator'
import type { RequestUser } from 'src/auth/types/requestUser.type'
import { WorkspaceMapper } from './WorkspaceMapper'
import {Inject} from '@nestjs/common'
import { WorkspaceResponseDto } from './dtos/WorkspaceResponseDto'

@Controller('workspaces')
@UseGuards(JwtAuthGuard)  // protegge tutti gli endpoint del controller
export class WorkspaceManagerController {
  constructor(@Inject('IWorkspaceManagerService') private readonly service: IWorkspaceManagerService) {}

  @Post()
  async create(@Body() dto: CreateWorkspaceDto, @User() user: RequestUser): Promise<CreateWorkspaceResponseDto> {
    // Mapper trasforma DTO + dati dal token in BO
    // Il controller NON costruisce logica — delega al mapper
    const bo = WorkspaceMapper.toCreateBO(dto, user)

    // Il service riceve solo BO e restituisce solo BO
    const result = await this.service.createWorkspace(bo)

    // Mapper trasforma il BO di risposta in DTO di risposta
    return WorkspaceMapper.toCreateResponseDto(result)
  }

  @Delete(':id')
  async delete(@Param('id') workspaceId: string, @User() user: RequestUser): Promise<void> {
    // passa l'id di chi chiede la cancellazione per la verifica
    await this.service.deleteWorkspace(workspaceId, user.userId)
  }

  @Get()
  async list(@User() user: RequestUser): Promise<WorkspaceResponseDto[]> {
    const bos = await this.service.getWorkspaces(user.userId)
    return bos.map(WorkspaceMapper.toListItemDto)
  }
}