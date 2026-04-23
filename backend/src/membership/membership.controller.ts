import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Inject,
  ValidationPipe,
  UsePipes,
  Patch,
  Param,
} from '@nestjs/common';
import { MembershipService } from './membership.service';
import {
  InviteUserDto,
  ManageInviteDto,
  GetInviteResponseDto,
} from './dto/membership.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { User } from '../auth/customDecorators/user.decorator';
import type { RequestUser } from '../auth/types/requestUser.type';
import { InviteUserInfo } from './type/inviteUser.type';
import { ManageInviteInfo } from './type/manageInvite.type';
import { IMembershipServiceToken } from './interfaces/IMembershipService.interface';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

@UseGuards(JwtAuthGuard)
@Controller('invitations')
export class MembershipController {
  constructor(
    @Inject(IMembershipServiceToken)
    private readonly membershipService: MembershipService,
  ) {}

  @ApiOperation({ summary: 'Invita un utente a unirsi a un workspace' })
  @ApiResponse({ status: 201, description: 'Invito inviato' })
  @ApiResponse({
    status: 400,
    description: "L'utente ha già un invito in sospeso per questo workspace",
  })
  @Post()
  @UsePipes(new ValidationPipe())
  async inviteUser(
    @Body() inviteUserDto: InviteUserDto,
    @User() user: RequestUser,
  ): Promise<void> {
    const inviteUserInfo: InviteUserInfo = {
      workspaceId: inviteUserDto.workspaceId,
      senderId: user.userId,
      recipientUsername: inviteUserDto.recipientUsername,
      recipientRole: inviteUserDto.recipientRole,
    };
    return this.membershipService.inviteUser(inviteUserInfo);
  }

  @ApiOperation({ summary: 'Ottieni gli inviti ricevuti' })
  @ApiResponse({
    status: 200,
    description: 'Lista degli inviti ricevuti',
    type: [GetInviteResponseDto],
  })
  @Get()
  @UsePipes(new ValidationPipe())
  async getInvites(@User() user: RequestUser): Promise<GetInviteResponseDto[]> {
    return this.membershipService.getInvites(user.userId);
  }

  @ApiOperation({ summary: 'Gestisci un invito (accetta o rifiuta)' })
  @ApiResponse({ status: 200, description: 'Invito gestito con successo' })
  @ApiResponse({
    status: 400,
    description: 'Azione non valida o invito già gestito',
  })
  @ApiResponse({
    status: 412,
    description: 'invito rifiutato perchè utente fa già parte del workspace',
  })
  @ApiParam({ name: 'id', description: "ID dell'invito da gestire" })
  @Patch(':id')
  @UsePipes(new ValidationPipe())
  async manageInvite(
    @Param('id') inviteId: string,
    @Body() manageInviteDto: ManageInviteDto,
  ): Promise<void> {
    const manageInviteInfo: ManageInviteInfo = {
      id: inviteId,
      action: manageInviteDto.action,
    };
    return this.membershipService.manageInvite(manageInviteInfo);
  }
}
