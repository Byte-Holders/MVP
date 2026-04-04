import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ _id: false })
export class ScanTargetSchema {
  @Prop({ required: true, type: String })
  repositoryId: string;

  @Prop({ required: true, type: String })
  branchName: string;
}

export const ScanTargetSchemaDefinition =
  SchemaFactory.createForClass(ScanTargetSchema);
