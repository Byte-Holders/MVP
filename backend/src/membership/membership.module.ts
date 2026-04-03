import { Module } from '@nestjs/common';
import { MembershipService } from './membership.service';
import { MembershipController } from './membership.controller';
import { MembershipRepository } from './membership.repository';

@Module({
  providers: [MembershipService, MembershipRepository],
  controllers: [MembershipController]
})
export class MembershipModule {}
