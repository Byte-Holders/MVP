import {
  Body,
  Controller,
  Post,
  UseGuards,
  Req,
  Delete,
  Param,
  Get,
} from '@nestjs/common';
import type { IWorkspaceManagerService } from './interfaces/workspaceManager.service.interface';
import { CreateWorkspaceDto } from './dtos/CreateWorkspaceDto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard'; // vedi sotto
import { CreateWorkspaceResponseDto } from './dtos/CreateWorkspaceResponseDto';
import { Request } from 'supertest';
import { User } from '../../auth/customDecorators/user.decorator';
import type { RequestUser } from '../../auth/types/requestUser.type';
import { WorkspaceMapper } from './WorkspaceMapper';
import { Inject } from '@nestjs/common';
import { WorkspaceResponseDto } from './dtos/WorkspaceResponseDto';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';

@Controller('workspaces')
@UseGuards(JwtAuthGuard) // protegge tutti gli endpoint del controller
export class WorkspaceManagerController {
  constructor(
    @Inject('IWorkspaceManagerService')
    private readonly service: IWorkspaceManagerService,
  ) {}

  @ApiOperation({
    summary: 'Crea un nuovo workspace',
    description:
      "Crea un workspace intestato all'utente autenticato. " +
      'Il nome deve essere unico per lo stesso utente.',
  })
  @ApiBody({ type: CreateWorkspaceDto })
  @ApiResponse({
    status: 201,
    description: 'Workspace creato con successo.',
    type: CreateWorkspaceResponseDto,
  })
  @ApiResponse({
    status: 409,
    description:
      "Esiste già un workspace con questo nome per l'utente corrente.",
    schema: {
      example: {
        statusCode: 409,
        message: 'Hai già un workspace chiamato "my-project"',
        error: 'Conflict',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Token JWT mancante o non valido.' })
  @Post()
  async create(
    @Body() dto: CreateWorkspaceDto,
    @User() user: RequestUser,
  ): Promise<CreateWorkspaceResponseDto> {
    // Mapper trasforma DTO + dati dal token in BO
    // Il controller NON costruisce logica — delega al mapper
    const bo = WorkspaceMapper.toCreateBO(dto, user);

    // Il service riceve solo BO e restituisce solo BO
    const result = await this.service.createWorkspace(bo);

    // Mapper trasforma il BO di risposta in DTO di risposta
    return WorkspaceMapper.toCreateResponseDto(result);
  }

  @ApiOperation({
    summary: 'Elimina un workspace',
    description: 'Solo il proprietario del workspace può eliminarlo.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID MongoDB del workspace da eliminare',
  })
  @ApiResponse({
    status: 200,
    description: 'Workspace eliminato con successo.',
  })
  @ApiResponse({
    status: 403,
    description: 'Solo il proprietario può eliminare il workspace.',
  })
  @ApiResponse({ status: 404, description: 'Workspace non trovato.' })
  @ApiResponse({ status: 401, description: 'Token JWT mancante o non valido.' })
  @Delete(':id')
  async delete(
    @Param('id') workspaceId: string,
    @User() user: RequestUser,
  ): Promise<void> {
    // passa l'id di chi chiede la cancellazione per la verifica
    await this.service.deleteWorkspace(workspaceId, user.userId);
  }

  @ApiOperation({
    summary: "Lista workspace dell'utente",
    description:
      "Restituisce tutti i workspace di cui l'utente autenticato è membro.",
  })
  @ApiResponse({
    status: 200,
    description: 'Lista workspace recuperata con successo.',
    type: [WorkspaceResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Token JWT mancante o non valido.' })
  @Get()
  async list(@User() user: RequestUser): Promise<WorkspaceResponseDto[]> {
    const bos = await this.service.getWorkspaces(user.userId);
    return bos.map(WorkspaceMapper.toListItemDto);
  }
}
