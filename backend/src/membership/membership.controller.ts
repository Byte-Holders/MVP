// ...existing code...
import { Controller, Post, Get, Body, Query, UseGuards } from '@nestjs/common';
import { MembershipService } from './membership.service';
import {
  InviteUserDto,
  ManageInviteDto,
  GetInviteDto,
} from './dto/membership.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

import { User } from '../auth/customDecorators/user.decorator';
import type { RequestUser } from '../auth/types/requestUser.type';

@UseGuards(JwtAuthGuard)
@Controller('membership')
export class MembershipController {
  constructor(private readonly membershipService: MembershipService) {}

  @Post('invite')
  async inviteUser(
    @Body() inviteUserDto: InviteUserDto,
    @User() user: RequestUser,
  ): Promise<void> {
    // mittente sovrascritto con l'utente realmente loggato per sicurezza
    inviteUserDto.senderId = user.userId;
    return this.membershipService.inviteUser(inviteUserDto);
  }

  @Get('invites')
  async getInvites(
    @Query() getInviteDto: GetInviteDto,
    @User() user: RequestUser,
  ): Promise<any[]> {
    // un utente può vedere solo i propri inviti
    getInviteDto.userId = user.userId;

    //console.log("ID dal Token:", user.userId);
    //console.log("ID dalla Query URL:", getInviteDto.userId);

    return this.membershipService.getInvites(getInviteDto);
  }

  @Post('manage')
  async manageInvite(
    @Body() manageInviteDto: ManageInviteDto,
    @User() user: RequestUser,
  ): Promise<void> {
    manageInviteDto.userId = user.userId; // un utente può gestire solo i propri inviti
    return this.membershipService.manageInvite(manageInviteDto);
  }
}
