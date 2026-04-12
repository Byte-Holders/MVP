import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { MembershipStatus } from '../dto/membership.dto';
import { WorkspaceRole } from 'src/workspace/roles.enum';

@Schema({ timestamps: true })
export class Membership extends Document {
  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'Workspace'  })
  workspaceId!: mongoose.Types.ObjectId;

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  senderId!: mongoose.Types.ObjectId;

  @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  recipientId!: mongoose.Types.ObjectId;

  @Prop({ required: true, enum: WorkspaceRole })
  recipientRole!: WorkspaceRole;

  @Prop({ default: MembershipStatus.Pending, enum: MembershipStatus })
  status!: MembershipStatus;
}

export const MembershipSchema = SchemaFactory.createForClass(Membership);
