import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type RepositoryDocument = HydratedDocument<Repository>;

@Schema()
export class Repository {
  @Prop({ required: true })
  repoId!: string;

  @Prop({ required: true })
  ownerName!: string;

  @Prop({ required: true })
  name!: string;

  @Prop()
  dateScan?: Date;

  @Prop({ type: Number })
  documentationScore?: number;

  @Prop({ type: Number })
  codeCoverage?: number;

  @Prop({ type: Number })
  cvss?: number;

  @Prop()
  accessToken?: string;
}

export const RepositorySchema = SchemaFactory.createForClass(Repository);
