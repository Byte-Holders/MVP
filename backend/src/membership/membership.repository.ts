import { Injectable, NotFoundException } from '@nestjs/common';
import { Membership } from './schema/membership.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose/dist/common/mongoose.decorators';
import { IMembershipRepository } from './interfaces/IMembershipRepository.interface';
import { MembershipEntity } from './entity/membership.entity';
import { MembershipPopulatedEntity } from './entity/membershipPopulated.entity';
import { CreateMembershipEntityParams } from './entity/createMembershipEntityParams';
import { MembershipStatus } from './dto/membership.dto';

@Injectable()
export class MembershipRepository implements IMembershipRepository {
  constructor(
    @InjectModel(Membership.name) private membershipModel: Model<Membership>,
  ) {}

  async addInvite(
    createMembershipEntityParams: CreateMembershipEntityParams,
  ): Promise<void> {
    const newInvite = new this.membershipModel(createMembershipEntityParams);
    await newInvite.save();
  }

  async updateInvite(
    membershipId: string,
    status: MembershipStatus,
  ): Promise<void> {
    const result = await this.membershipModel
      .updateOne({ _id: membershipId }, { $set: { status: status } })
      .exec();

    if (result.matchedCount === 0) {
      throw new NotFoundException(
        'Nessun invito pendente trovato per questo utente',
      );
    }
  }

  async findPendingInvites(
    recipientId: string,
  ): Promise<MembershipPopulatedEntity[]> {
    const pendingInvites = await this.membershipModel
      .find({
        recipientId: recipientId,
        status: MembershipStatus.Pending,
      })
      .populate('workspaceId', 'name')
      .populate('senderId', 'username')
      .populate('recipientId', 'username')
      .lean()
      .exec();

    const populatedMemberships: MembershipPopulatedEntity[] =
      pendingInvites.map((membership: any) => ({
        _id: membership._id.toString(),
        workspaceName: membership.workspaceId?.name,
        senderUsername: membership.senderId?.username,
        recipientUsername: membership.recipientId?.username,
        recipientRole: membership.recipientRole,
        status: membership.status,
      }));

    return populatedMemberships;
  }

  async findPendingInvite(
    recipientId: string,
    workspaceId: string,
  ): Promise<MembershipEntity | null> {
    const membership = await this.membershipModel
      .findOne({
        recipientId: recipientId,
        workspaceId: workspaceId,
        status: MembershipStatus.Pending,
      })
      .lean()
      .exec();

    if (!membership) {
      return null;
    }

    const membershipEntity: MembershipEntity = {
      _id: membership._id.toString(),
      workspaceId: membership.workspaceId.toString(),
      senderId: membership.senderId.toString(),
      recipientId: membership.recipientId.toString(),
      recipientRole: membership.recipientRole,
      status: membership.status,
    };

    return membershipEntity;
  }

  async findPendingInviteById(
    membershipId: string,
  ): Promise<MembershipEntity | null> {
    const membership = await this.membershipModel
      .findOne({
        _id: membershipId,
        status: MembershipStatus.Pending,
      })
      .lean()
      .exec();

    if (!membership) {
      return null;
    }

    const membershipEntity: MembershipEntity = {
      _id: membership._id.toString(),
      workspaceId: membership.workspaceId.toString(),
      senderId: membership.senderId.toString(),
      recipientId: membership.recipientId.toString(),
      recipientRole: membership.recipientRole,
      status: membership.status,
    };

    return membershipEntity;
  }
}
