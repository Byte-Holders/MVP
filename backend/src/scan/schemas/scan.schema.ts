import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ScanTargetSchema } from './scan-target.schema';
import { ScanStatus } from '../scan-status/enums/scan-status.enum';

@Schema({ timestamps: true, collection: 'scans' })
export class ScanSchemaClass {
  @Prop({ required: true, type: String })
  id: string;

  @Prop({ required: true, type: String })
  workspaceId: string;

  @Prop({ required: true, type: ScanTargetSchema })
  target: ScanTargetSchema;

  @Prop({ required: true, type: String, enum: ScanStatus })
  status: ScanStatus;

  @Prop({ required: true, type: String })
  containerRef: string;

  @Prop({ required: true, type: Date })
  startTime: Date;

  @Prop({ required: false, type: Date, default: undefined })
  endTime?: Date;

  @Prop({ required: true, type: String })
  callbackToken: string;
}

export type ScanDocument = ScanSchemaClass & Document;
export const ScanSchema = SchemaFactory.createForClass(ScanSchemaClass);

// ── Indici ────────────────────────────────────────────────────────────────────

ScanSchema.index(
  { 'target.repositoryId': 1, 'target.branchName': 1 },
  { name: 'idx_repo_branch' },
);
