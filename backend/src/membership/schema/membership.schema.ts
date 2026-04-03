import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Membership extends Document {
  @Prop({ required: true })
  workspaceId!: string; // Aggiungi !

  @Prop({ required: true })
  senderUsername!: string;

  @Prop({ required: true, index: true })
  recipientUsername!: string;

  @Prop({ required: true })
  recipientRole!: string;

  @Prop({ default: 'PENDING' })
  status!: string;
}

export const MembershipSchema = SchemaFactory.createForClass(Membership);