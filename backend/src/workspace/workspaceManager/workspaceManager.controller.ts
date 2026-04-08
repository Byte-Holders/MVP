import { Body, Controller, Post, UseGuards, Req, Delete, Param } from '@nestjs/common'
import  type { IWorkspaceManagerService } from './interfaces/workspaceManager.service.interface'
import { CreateWorkspaceDto } from './dto/CreateWorkspaceDto'
import { JwtAuthGuard } from '../../auth/jwt-auth.guard'  // vedi sotto
import { CreateWorkspaceResponseDto } from './dto/CreateWorkspaceResponseDto'
import { Request } from 'supertest'
import { User } from 'src/auth/customDecorators/user.decorator'
import type { RequestUser } from 'src/auth/types/requestUser.type'
import { WorkspaceMapper } from './WorkspaceMapper'
import {Inject} from '@nestjs/common'
import { WorkspaceResponseDto } from './dto/WorkspaceResponseDto'

@Controller('workspaces')
@UseGuards(JwtAuthGuard)  // protegge tutti gli endpoint del controller
export class WorkspaceManagerController {
  constructor(@Inject('IWorkspaceManagerService') private readonly service: IWorkspaceManagerService) {}

  @Post()
  async create(@Body() dto: CreateWorkspaceDto, @User() user: RequestUser): Promise<CreateWorkspaceResponseDto> {
    console.log('Controller riceve questa richiesta per creare un workspace:', { dto, user }) // log per debug
    // Mapper trasforma DTO + dati dal token in BO
    // Il controller NON costruisce logica — delega al mapper
    const bo = WorkspaceMapper.toCreateBO(dto, user)

    // Il service riceve solo BO e restituisce solo BO
    const result = await this.service.createWorkspace(bo)
    console.log('Service ha creato questo workspace:', result) // log per debug

    // Mapper trasforma il BO di risposta in DTO di risposta
    return WorkspaceMapper.toCreateResponseDto(result)
  }
    //return this.service.createWorkspace(dto, user.username, user.sub)// estratto dal token da JwtAuthGuard

  @Delete(':id')
  async delete(@Param('id') workspaceId: string, @User() user: RequestUser): Promise<void> {
    // passa l'id di chi chiede la cancellazione per la verifica
    await this.service.deleteWorkspace(workspaceId, user.userId)
  }

  @Post('list')
  async list(@User() user: RequestUser): Promise<WorkspaceResponseDto[]> {
    const bos = await this.service.getWorkspaces(user.userId)
    return bos.map(WorkspaceMapper.toListItemDto)
  }
}