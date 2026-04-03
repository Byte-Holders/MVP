import { Controller, Post, Get, Body, Query } from '@nestjs/common';
import { MembershipService } from './membership.service';
import { InviteUserDto, ManageInviteDto, GetInviteDto } from './dto/membership.dto';

@Controller('membership')
export class MembershipController {
  constructor(private readonly membershipService: MembershipService) {}

  @Post('invite')
  async inviteUser(@Body() dto: InviteUserDto): Promise<void> {
    return this.membershipService.inviteUser(dto);
  }

  @Get('invites')
  async getInvites(@Query() dto: GetInviteDto): Promise<InviteUserDto[]> {
    return this.membershipService.getInvites(dto);
  }

  @Post('manage')
  async manageInvite(@Body() dto: ManageInviteDto): Promise<void> {
    return this.membershipService.manageInvite(dto);
  }
}
