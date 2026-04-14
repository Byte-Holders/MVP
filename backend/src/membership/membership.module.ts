import { Module } from '@nestjs/common';
import { MembershipService } from './membership.service';
import { MembershipController } from './membership.controller';
import { MembershipRepository } from './membership.repository';
import { MongooseModule } from '@nestjs/mongoose/dist/mongoose.module';
import { Membership, MembershipSchema } from './schema/membership.schema';
import { WorkspaceUserModule } from '../workspace/workspaceUser/workspaceUser.module';
import { UserModule } from '../user/user.module';
import { IMembershipServiceToken } from './interfaces/IMembershipService.interface';
import { IMembershipRepositoryToken } from './interfaces/IMembershipRepository.interface';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Membership.name, schema: MembershipSchema },
    ]),
    UserModule,
    WorkspaceUserModule,
  ],
  providers: [
    {
      provide: IMembershipServiceToken,
      useClass: MembershipService,
    },
    {
      provide: IMembershipRepositoryToken,
      useClass: MembershipRepository,
    },
  ],
  controllers: [MembershipController],
})
export class MembershipModule {}
