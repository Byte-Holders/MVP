import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { WorkspaceRole } from '../roles.enum';

export type WorkspaceMemberDocument = HydratedDocument<WorkspaceMember>;

@Schema()
export class WorkspaceMember {
  @Prop({ type: String, required: true })
  userId!: string;

  @Prop({ required: true })
  userUsername!: string;

  @Prop({ type: String, enum: WorkspaceRole, required: true })
  role!: WorkspaceRole;
}

export const WorkspaceMemberSchema = SchemaFactory.createForClass(WorkspaceMember);
