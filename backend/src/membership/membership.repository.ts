import { Injectable } from '@nestjs/common';
import { Membership } from './schema/membership.schema';
import { AddInviteDto, ManageInviteAction, ResearchInviteDto, UpdateInviteDto } from './dto/membership.dto';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose/dist/common/mongoose.decorators';
import { IMembershipRepository } from './interfaces/IMembershipRepository.interface';

@Injectable()
export class MembershipRepository implements IMembershipRepository {
  constructor(
    @InjectModel(Membership.name) private membershipModel: Model<Membership>
  ) {}

  async addInvite(AddInviteDto: AddInviteDto): Promise<void> {
    const newInvite = new this.membershipModel({
      ...AddInviteDto,
      status: 'PENDING'
    });
    await newInvite.save();
  }

  async updateInvite(UpdateInviteDto: UpdateInviteDto): Promise<void> {
    const newStatus = UpdateInviteDto.action === ManageInviteAction.Accept ? 'ACCEPTED' : 'REJECTED';

    const result = await this.membershipModel.updateOne(
      { _id: UpdateInviteDto.membershipId },
      { $set: { status: newStatus } }
    ).exec();

    //TODO: Gestire il caso in cui non è stato trovato alcun invito da aggiornare (opzionale)
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

  // Trova l'unico documento che soddisfa tutti e tre i criteri
  async findPendingInvite(researchInviteDto: ResearchInviteDto): Promise<Membership | null> {
    return this.membershipModel.findOne({ 
      recipientId: researchInviteDto.userId, 
      workspaceId: researchInviteDto.workspaceId, 
      status: 'PENDING' 
    }).exec();
  }
}