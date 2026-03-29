import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { HydratedDocument } from 'mongoose';
import { User } from '../../user/schemas/user.schema';

export type WorkspaceMemberDocument = HydratedDocument<WorkspaceMember>;

@Schema()
export class WorkspaceMember {
    @Prop({type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true})
    userId: User;

    @Prop({required: true})
    role: string;
}

export const WorkspaceMemberSchema = SchemaFactory.createForClass(WorkspaceMember);