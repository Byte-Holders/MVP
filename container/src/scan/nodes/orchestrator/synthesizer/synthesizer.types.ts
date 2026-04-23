import { TestReport } from '../coverage/coverage-report.type';
import { DepsReport } from '../dependency/deps-report.type';
import { DocsReport } from '../docs/docs-report.type';
import { VulnerabilitiesReport } from '../security/security-report.type';
import { Language } from '../github/language.type';
import { Target } from '../../../target.types';

export type ReportSummary = {
  summary: string;
  mark: number;
};

export type TechReport = {
  libraries: DepsReport['libraries'];
  frameworks: DepsReport['frameworks'];
  languages: Language[];
};

export type DataReport = {
  depsReport: Pick<DepsReport, 'vulnerabilities' | 'vulnerabilityAnalysis'>;
  vulnerabilitiesReport: VulnerabilitiesReport;
  docsReport: DocsReport;
  testReport: TestReport;
  techReport: TechReport;
};

export type ReportMetadata = {
  startScanTime: Date;
  endScanTime: Date | null;
  target: Omit<Target, 'accessToken'>;
};

export type Report = {
  summary: ReportSummary;
  data: DataReport;
  metadata: ReportMetadata;
};
