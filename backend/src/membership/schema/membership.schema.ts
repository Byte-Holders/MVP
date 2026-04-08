import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Membership extends Document {
  @Prop({ required: true, ref: 'Workspace' })
  workspaceId!: string;

  @Prop({ required: true, ref: 'User' })
  senderId!: string;

  @Prop({ required: true, ref: 'User' })
  recipientId!: string;

  @Prop({ required: true })
  recipientRole!: string;

  @Prop({ default: 'PENDING' })
  status!: string;
}

export const MembershipSchema = SchemaFactory.createForClass(Membership);
