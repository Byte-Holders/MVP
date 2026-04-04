import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ScanStatus } from '../dto';
import { ScanTargetSchema } from './scan-target.schema';

// Scan

@Schema({ timestamps: true, collection: 'scans' })
export class ScanSchemaClass {
  @Prop({ required: true, type: String })
  scanId: string; // UUID generato lato app, distinto dall'_id di Mongo

  @Prop({ required: true, type: WorkspaceSchema })
  workspace: WorkspaceSchema;

  @Prop({ required: true, type: RepositorySchema })
  repository: RepositorySchema;

  @Prop({ required: true, type: ScanTargetSchema })
  target: ScanTargetSchema;

  @Prop({ required: true, type: String, enum: Object.values(ScanStatus) })
  status: ScanStatus;

  @Prop({ required: true, type: String })
  containerRef: string;

  @Prop({ required: true, type: Date })
  startTime: Date;

  @Prop({ required: false, type: Date, default: null })
  endTime: Date | null;

  @Prop({ required: false, type: String, default: null })
  callbackToken: string | null;
}

export type ScanDocument = ScanSchemaClass & Document;
export const ScanSchema = SchemaFactory.createForClass(ScanSchemaClass);

// ── Indici ────────────────────────────────────────────────────────────────────

// Lookup primario: owner + repo + branch → scan
ScanSchema.index(
  { 'repository.owner': 1, 'repository.name': 1, 'target.branchName': 1 },
  { name: 'idx_owner_repo_branch' },
);

// Lookup per scanId applicativo
ScanSchema.index({ scanId: 1 }, { unique: true, name: 'idx_scan_id' });
