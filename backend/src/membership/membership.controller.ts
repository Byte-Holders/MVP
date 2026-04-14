import { Controller, Post, Get, Body, Query, UseGuards, Inject, ValidationPipe, UsePipes } from '@nestjs/common';
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

@UseGuards(JwtAuthGuard)
@Controller('membership')
export class MembershipController {
  constructor(
    @Inject(IMembershipServiceToken) private readonly membershipService: MembershipService,
  ) {}

  @Post('invite')
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

  @Get('invites')
  @UsePipes(new ValidationPipe())
  async getInvites(
    @User() user: RequestUser,
  ): Promise<GetInviteResponseDto[]> {
    return this.membershipService.getInvites(user.userId);
  }

  @Post('manage')
  @UsePipes(new ValidationPipe())
  async manageInvite(
    @Body() manageInviteDto: ManageInviteDto,
  ): Promise<void> {
    const manageInviteInfo: ManageInviteInfo = {
      id: manageInviteDto.membershipId,
      action: manageInviteDto.action,
    }
    return this.membershipService.manageInvite(manageInviteInfo);
  }
}
