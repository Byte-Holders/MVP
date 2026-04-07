import { Injectable } from '@nestjs/common';
import { Membership } from './schema/membership.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose/dist/common/mongoose.decorators';
import { IMembershipRepository } from './interfaces/IMembershipRepository.interface';

@Injectable()
export class MembershipRepository implements IMembershipRepository {
  constructor(
    @InjectModel(Membership.name) private membershipModel: Model<Membership>
  ) {}

  async addInvite(inviteData: { workspaceId: string; senderId: string; recipientId: string; recipientRole: string }): Promise<void> {
    const newInvite = new this.membershipModel({
      ...inviteData,
      status: 'PENDING'
    });
    await newInvite.save();
  }

  async updateInvite(membershipId: string, status: string): Promise<void> {
    const result = await this.membershipModel.updateOne(
      { _id: membershipId },
      { $set: { status: status } }
    ).exec();

    if (result.matchedCount === 0) {
      throw new Error('Nessun invito pendente trovato per questo utente');
    }
  }

  async findPendingInvites(recipientId: string): Promise<Membership[]> {
    return this.membershipModel.find({ 
      recipientId: recipientId, 
      status: 'PENDING' 
    }).exec();
  }

  async findPendingInvite(recipientId: string, workspaceId: string): Promise<Membership | null> {
    return this.membershipModel.findOne({ 
      recipientId: recipientId, 
      workspaceId: workspaceId, 
      status: 'PENDING' 
    }).exec();
  }
}