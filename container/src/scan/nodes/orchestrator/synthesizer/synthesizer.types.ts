import { TestReport } from '../coverage/coverage-report.type';
import { DepsReport } from '../dependency/deps-report.type';
import { DocsReport } from '../docs/docs-report.type';
import { VulnerabilitiesReport } from '../security/security-report.type';
import { Language } from '../github/language.type';
import { Target } from '../../../target.types';

export type GuidelineUnit = {
  name: string;
  recommendation: string;
};

export type CodeQualityReport = {
  analysis: GuidelineUnit[];
  mark: number;
};

export type ReportSummary = {
  summary: string;
  mark: number;
};

export type DataReport = {
  depsReport: DepsReport;
  vulnerabilitiesReport: VulnerabilitiesReport;
  docsReport: DocsReport;
  testReport: TestReport;
  languages: Language[];
  codeQualityReport: CodeQualityReport;
};

export type ReportMetadata = {
  startScanTime: Date;
  endScanTime: Date | null;
  target: Target;
};

export type Report = {
  summary: ReportSummary;
  data: DataReport;
  metadata: ReportMetadata;
};
