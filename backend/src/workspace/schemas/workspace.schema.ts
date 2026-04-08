import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { HydratedDocument } from 'mongoose';
import {
  WorkspaceMember,
  WorkspaceMemberSchema,
} from './workspaceMember.schema';
import { User } from '../../user/schemas/user.schema';
import {
  RepositoryOfWorkspace,
  RepositoryOfWorkspaceSchema,
} from './repositoryOfWorkspace.schema';

export type WorkspaceDocument = HydratedDocument<Workspace>;

@Schema()
export class Workspace {
  /*@Prop({ required: true })
  _id: string; MongoDb will automatically generate an _id field, so we don't need to define it here.*/

  @Prop({ required: true })
  name!: string;

  /*@Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required:c true })
  ownerId: User;*/
  @Prop({ required: true })
  ownerId!: string;

  @Prop({ required: true })
  creationDate!: Date;

  @Prop({ type: [WorkspaceMemberSchema], default: [] })
  members!: WorkspaceMember[];

  @Prop({ type: [RepositoryOfWorkspaceSchema], default: [] })
  repositories!: RepositoryOfWorkspace[];
}

export const WorkspaceSchema = SchemaFactory.createForClass(Workspace);

// Indice composto: stesso utente non può avere due workspace con stesso nome
WorkspaceSchema.index({ ownerId: 1, name: 1 }, { unique: true });
