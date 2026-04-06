import { CoverageReport } from '../coverage/coverage-report.type';
import { DepsReport } from '../dependency/deps-report.type';
import { DocsReport } from '../docs/docs-report.type';
import { VulnerabilitiesReport } from '../security/security-report.type';
import { Target } from '../../target.types';

export type ReportSummary = {
  summary: string;
  mark: number;
};

export type DataReport = {
  depsReport: DepsReport;
  vulnerabilitiesReport: VulnerabilitiesReport;
  docsReport: DocsReport;
  coverageReport: CoverageReport;
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
