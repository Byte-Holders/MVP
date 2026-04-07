// ...existing code...
import { Controller, Post, Get, Body, Query, UseGuards } from '@nestjs/common';
import { MembershipService } from './membership.service';
import { InviteUserDto, ManageInviteDto, GetInviteDto } from './dto/membership.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

import { User } from '../auth/customDecorators/user.decorator'; 
import { RequestUser } from '../auth/types/requestUser.type'; 

@UseGuards(JwtAuthGuard)
@Controller('membership')
export class MembershipController {
  constructor(private readonly membershipService: MembershipService) {}

  @Post('invite')
  async inviteUser(
    @Body() dto: InviteUserDto,
    @User() user: RequestUser
  ): Promise<void> {
    // mittente sovrascritto con l'utente realmente loggato per sicurezza
    dto.senderId = user.username; 
    return this.membershipService.inviteUser(dto);
  }

  @Get('invites')
  async getInvites(
    @Query() dto: GetInviteDto,
    @User() user: RequestUser
  ): Promise<any[]> {
    // un utente può vedere solo i propri inviti
    dto.userId = user.username; 
    return this.membershipService.getInvites(dto);
  }

  @Post('manage')
  async manageInvite(
    @Body() dto: ManageInviteDto,
    @User() user: RequestUser
  ): Promise<void> {
    return this.membershipService.manageInvite(dto);
  }
}