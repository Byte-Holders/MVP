import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type RepositoryDocument = HydratedDocument<Repository>;

@Schema()
export class Repository {
  @Prop({ required: true })
  repoId!: string; //id di GitHub

  @Prop({ required: true })
  ownerName!: string;

  @Prop({ required: true })
  name!: string;

  @Prop({ type: [String], default: [] })
  branches!: string[];
  //da sistemare questo se abbiamo detto che salviamo i report qua
  //pensavo di fare un array di oggetti, ognuno con un branchName e un array di report
}

export const RepositorySchema = SchemaFactory.createForClass(Repository);
