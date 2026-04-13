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

  @Prop({ required: true, type: String })
  recipientRole!: string;

  @Prop({ default: 'PENDING', type: String })
  status!: string;
}

export const MembershipSchema = SchemaFactory.createForClass(Membership);
