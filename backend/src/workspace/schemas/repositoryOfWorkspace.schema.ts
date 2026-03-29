import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { HydratedDocument } from 'mongoose';
import { Repository } from '../../repository/schemas/repository.schema';

export type RepositoryOfWorkspaceDocument = HydratedDocument<RepositoryOfWorkspace>;

@Schema()
export class RepositoryOfWorkspace {
    @Prop({type: mongoose.Schema.Types.ObjectId, ref: 'Repository', required: true})
    repoId: Repository;

    @Prop()
    defaultBranch: string;

    @Prop({required: true})
    gitHubUserToken: string;
}

export const RepositoryOfWorkspaceSchema = SchemaFactory.createForClass(RepositoryOfWorkspace);