import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type RepositoryDocument = HydratedDocument<Repository>;

@Schema()
export class Repository {
    @Prop({required: true})
    repoId: string;    //id di GitHub

    @Prop({required: true})
    ownerName: string;

    @Prop({required: true})
    name: string;

    @Prop({type: [String], default: []})
    branches: string[];   //i branch su cui è stata fatta almeno una scansione
}

export const RepositorySchema = SchemaFactory.createForClass(Repository);