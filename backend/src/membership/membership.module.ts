import { Module } from '@nestjs/common';
import { MembershipService } from './membership.service';
import { MembershipController } from './membership.controller';
import { MembershipRepository } from './membership.repository';
import { MongooseModule } from '@nestjs/mongoose/dist/mongoose.module';
import { Membership, MembershipSchema } from './schema/membership.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Membership.name, schema: MembershipSchema }])
  ],
  providers: [MembershipService, MembershipRepository],
  controllers: [MembershipController]
})
export class MembershipModule {}
