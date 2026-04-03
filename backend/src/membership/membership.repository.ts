import { Injectable } from '@nestjs/common';
import { Membership } from './schema/membership.schema';
import { InviteUserDto, ManageInviteAction } from './dto/membership.dto';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose/dist/common/mongoose.decorators';

@Injectable()
export class MembershipRepository {
  constructor(
    @InjectModel(Membership.name) private membershipModel: Model<Membership>
  ) {}

  async saveInvite(invite: InviteUserDto): Promise<void> {
    const newInvite = new this.membershipModel({
      ...invite,
      workspaceId: invite.workspace.id,
      status: 'PENDING'
    });
    await newInvite.save();
  }

  async findByUsername(username: string): Promise<Membership[]> {
    return this.membershipModel.find({ recipientUsername: username }).exec();
  }

  async updateStatus(username: string, action: ManageInviteAction): Promise<void> {
    const newStatus = action === ManageInviteAction.Accept ? 'ACCEPTED' : 'REJECTED';

    const result = await this.membershipModel.updateOne(
      { recipientUsername: username, status: 'PENDING' },
      { $set: { status: newStatus } }
    ).exec();

    //TODO: Gestire il caso in cui non è stato trovato alcun invito da aggiornare (opzionale)
    if (result.matchedCount === 0) {
      throw new Error('Nessun invito pendente trovato per questo utente');
    }
  }

  async findPendingInvite(username: string, workspaceId: string): Promise<Membership | null> {
    return this.membershipModel.findOne({ 
      recipientUsername: username, 
      workspaceId: workspaceId, 
      status: 'PENDING' 
    }).exec();
  }
}