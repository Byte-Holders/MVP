import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

// ── Leaf schemas ──────────────────────────────────────────────────────────────

@Schema({ _id: false })
class DependencySchema {
  @Prop({ required: true, type: String })
  name!: string;

  @Prop({ required: true, type: String })
  version!: string;
}
const DependencySchemaDefinition =
  SchemaFactory.createForClass(DependencySchema);

@Schema({ _id: false })
class DepVulnerabilitySchema {
  @Prop({ required: true, type: String })
  id!: string;

  @Prop({ required: true, type: String })
  severity!: string;

  @Prop({ required: true, type: String })
  packageName!: string;

  @Prop({ required: true, type: String })
  packageVersion!: string;

  @Prop({ required: false, type: String })
  description?: string;

  @Prop({ required: false, type: String })
  fixVersion?: string;
}
const DepVulnerabilitySchemaDefinition = SchemaFactory.createForClass(
  DepVulnerabilitySchema,
);

@Schema({ _id: false })
class CodeVulnerabilitySchema {
  @Prop({ required: true, type: String })
  id!: string;

  @Prop({ required: true, type: String })
  path!: string;

  @Prop({ required: true, type: String })
  description!: string;

  @Prop({ required: true, type: String })
  remediation!: string;

  @Prop({ required: true, type: Number })
  severity!: number;

  @Prop({ required: true, type: String })
  impact!: string;

  @Prop({ required: true, type: String })
  category!: string;

  @Prop({ required: false, type: String })
  cwe?: string;

  @Prop({ required: false, type: [String] })
  owasp?: string[];
}
const CodeVulnerabilitySchemaDefinition = SchemaFactory.createForClass(
  CodeVulnerabilitySchema,
);

@Schema({ _id: false })
class FailedTestSchema {
  @Prop({ required: true, type: String })
  name!: string;

  @Prop({ required: true, type: String })
  path!: string;

  @Prop({ required: true, type: String })
  messageSummary!: string;
}
const FailedTestSchemaDefinition =
  SchemaFactory.createForClass(FailedTestSchema);

@Schema({ _id: false })
class CoverageReportSchema {
  @Prop({ required: true, type: Number })
  statements!: number;

  @Prop({ required: true, type: Number })
  branches!: number;

  @Prop({ required: true, type: Number })
  functions!: number;

  @Prop({ required: true, type: Number })
  lines!: number;
}
const CoverageReportSchemaDefinition =
  SchemaFactory.createForClass(CoverageReportSchema);

@Schema({ _id: false })
class TechEntrySchema {
  @Prop({ required: true, type: String })
  name!: string;

  @Prop({ required: true, type: String })
  version!: string;
}
const TechEntrySchemaDefinition = SchemaFactory.createForClass(TechEntrySchema);

@Schema({ _id: false })
class LanguageSchema {
  @Prop({ required: true, type: String })
  name!: string;

  @Prop({ required: true, type: Number })
  value!: number;
}
const LanguageSchemaDefinition = SchemaFactory.createForClass(LanguageSchema);

// ── Composite sub-document schemas ───────────────────────────────────────────

@Schema({ _id: false })
class DepsReportSchema {
  @Prop({ required: false, type: [DependencySchemaDefinition] })
  list?: DependencySchema[];

  @Prop({ required: true, type: [DepVulnerabilitySchemaDefinition] })
  vulnerabilities!: DepVulnerabilitySchema[];

  @Prop({ required: true, type: String })
  vulnerabilityAnalysis!: string;
}
const DepsReportSchemaDefinition =
  SchemaFactory.createForClass(DepsReportSchema);

@Schema({ _id: false })
class VulnerabilitiesReportSchema {
  @Prop({ required: true, type: [CodeVulnerabilitySchemaDefinition] })
  vulnerabilities!: CodeVulnerabilitySchema[];

  @Prop({ required: true, type: Number })
  mark!: number;
}
const VulnerabilitiesReportSchemaDefinition = SchemaFactory.createForClass(
  VulnerabilitiesReportSchema,
);

@Schema({ _id: false })
class DocsReportSchema {
  @Prop({ required: true, type: String })
  readmeReport!: string;

  @Prop({ required: true, type: String })
  commentReport!: string;

  @Prop({ required: true, type: Number })
  mark!: number;
}
const DocsReportSchemaDefinition =
  SchemaFactory.createForClass(DocsReportSchema);

@Schema({ _id: false })
class TestReportSchema {
  @Prop({ required: true, type: CoverageReportSchemaDefinition })
  coverageReport!: CoverageReportSchema;

  @Prop({ required: true, type: [FailedTestSchemaDefinition] })
  failedTests!: FailedTestSchema[];

  @Prop({ required: true, type: Number })
  testsRun!: number;
}
const TestReportSchemaDefinition =
  SchemaFactory.createForClass(TestReportSchema);

@Schema({ _id: false })
class TechReportSchema {
  @Prop({ required: true, type: [TechEntrySchemaDefinition] })
  libraries!: TechEntrySchema[];

  @Prop({ required: true, type: [TechEntrySchemaDefinition] })
  frameworks!: TechEntrySchema[];

  @Prop({ required: true, type: [LanguageSchemaDefinition] })
  languages!: LanguageSchema[];
}
const TechReportSchemaDefinition =
  SchemaFactory.createForClass(TechReportSchema);

// ── Top-level sub-document schemas ───────────────────────────────────────────

@Schema({ _id: false })
class ReportSummarySchema {
  @Prop({ required: true, type: String })
  summary!: string;

  @Prop({ required: true, type: Number })
  mark!: number;
}
const ReportSummarySchemaDefinition =
  SchemaFactory.createForClass(ReportSummarySchema);

@Schema({ _id: false })
class ReportDataSchema {
  @Prop({ required: true, type: DepsReportSchemaDefinition })
  depsReport!: DepsReportSchema;

  @Prop({ required: true, type: VulnerabilitiesReportSchemaDefinition })
  vulnerabilitiesReport!: VulnerabilitiesReportSchema;

  @Prop({ required: true, type: DocsReportSchemaDefinition })
  docsReport!: DocsReportSchema;

  @Prop({ required: true, type: TestReportSchemaDefinition })
  testReport!: TestReportSchema;

  @Prop({ required: true, type: TechReportSchemaDefinition })
  techReport!: TechReportSchema;
}
const ReportDataSchemaDefinition =
  SchemaFactory.createForClass(ReportDataSchema);

@Schema({ _id: false })
class ReportTargetSchema {
  @Prop({ required: true, type: String })
  repositoryId!: string;

  @Prop({ required: true, type: String })
  branch!: string;
}
const ReportTargetSchemaDefinition =
  SchemaFactory.createForClass(ReportTargetSchema);

@Schema({ _id: false })
class ReportMetadataSchema {
  @Prop({ required: true, type: Date })
  startScanTime!: Date;

  @Prop({ required: true, type: Date })
  endScanTime!: Date;

  @Prop({ required: true, type: ReportTargetSchemaDefinition })
  target!: ReportTargetSchema;
}
const ReportMetadataSchemaDefinition =
  SchemaFactory.createForClass(ReportMetadataSchema);

// ── Root schema ───────────────────────────────────────────────────────────────

@Schema({ timestamps: true, collection: 'reports' })
export class ReportSchemaClass {
  @Prop({ required: false, type: ReportSummarySchemaDefinition })
  summary?: ReportSummarySchema;

  @Prop({ required: true, type: ReportDataSchemaDefinition })
  data!: ReportDataSchema;

  @Prop({ required: false, type: ReportMetadataSchemaDefinition })
  metadata?: ReportMetadataSchema;
}

export type ReportDocument = ReportSchemaClass & Document;
export const ReportSchema = SchemaFactory.createForClass(ReportSchemaClass);

ReportSchema.index(
  {
    'metadata.target.repositoryId': 1,
    'metadata.target.branch': 1,
  },
  { name: 'idx_target' },
);
