import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { HydratedDocument } from 'mongoose';
import { WorkspaceMember, WorkspaceMemberSchema } from './workspaceMember.schema';
import { User } from '../../user/schemas/user.schema';
import { RepositoryOfWorkspace, RepositoryOfWorkspaceSchema } from './repositoryOfWorkspace.schema';

export type WorkspaceDocument = HydratedDocument<Workspace>;

@Schema()
export class Workspace {
    @Prop({required: true})
    name: string;

    @Prop({type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true})
    ownerId: User;

    @Prop({required: true})
    creationDate: Date;

    @Prop({type: [WorkspaceMemberSchema], default: []})
    members: WorkspaceMember[];

    @Prop({type: [RepositoryOfWorkspaceSchema], default: []})
    repositories: RepositoryOfWorkspace[];
}

export const WorkspaceSchema = SchemaFactory.createForClass(Workspace);