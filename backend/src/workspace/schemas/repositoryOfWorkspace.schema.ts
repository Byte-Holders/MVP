import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { HydratedDocument } from 'mongoose';
import { Repository } from './repository.schema';

export type RepositoryOfWorkspaceDocument =
  HydratedDocument<RepositoryOfWorkspace>;

@Schema({ _id: false }) // embedded subdocument, non collection separata, Senza _id: false, Mongoose aggiunge automaticamente un _id a ogni elemento dell'array repositories[]. Non ti serve perché non accedi mai a un singolo RepositoryOfWorkspace tramite il suo ID — accedi tramite workspaceId + repoId.
export class RepositoryOfWorkspace {
  /*@Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Repository',
    required: true,
  })
  repoId!: Repository;*/
  @Prop({ type: String, required: true })
  repoId!: string;

  @Prop()
  defaultBranch?: string;

  @Prop()
  gitHubUserToken?: string;
}

export const RepositoryOfWorkspaceSchema = SchemaFactory.createForClass(
  RepositoryOfWorkspace,
);
