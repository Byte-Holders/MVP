export class DependencyEntity {
  name!: string;
  version!: string;
}

export class DepVulnerabilityEntity {
  id!: string;
  severity!: string;
  packageName!: string;
  packageVersion!: string;
  fixVersion?: string;
}

export class DepsReportEntity {
  list?: DependencyEntity[];
  vulnerabilities!: DepVulnerabilityEntity[];
  vulnerabilityAnalysis!: string;
}

export class CodeVulnerabilityEntity {
  id!: string;
  path!: string;
  description!: string;
  remediation!: string;
  severity!: number;
  impact!: string;
  category!: string;
  cwe!: string[];
  owasp!: string[];
}

export class VulnerabilitiesReportEntity {
  vulnerabilities!: CodeVulnerabilityEntity[];
  mark!: number;
}

export class DocsReportEntity {
  readmeReport!: string;
  commentReport!: string;
  mark!: number;
}

export class CoverageReportEntity {
  statements!: number;
  branches!: number;
  functions!: number;
  lines!: number;
}

export class FailedTestEntity {
  name!: string;
  path!: string;
  messageSummary!: string;
}

export class TestReportEntity {
  coverageReport!: CoverageReportEntity;
  failedTests!: FailedTestEntity[];
  testsRun!: number;
}

export class TechEntryEntity {
  name!: string;
  version!: string;
}

export class LanguageEntity {
  name!: string;
  value!: number;
}

export class TechReportEntity {
  libraries!: TechEntryEntity[];
  frameworks!: TechEntryEntity[];
  languages!: LanguageEntity[];
}

export class ReportDataEntity {
  depsReport!: DepsReportEntity;
  vulnerabilitiesReport!: VulnerabilitiesReportEntity;
  docsReport!: DocsReportEntity;
  testReport!: TestReportEntity;
  techReport!: TechReportEntity;
}

export class ReportSummaryEntity {
  summary!: string;
  mark!: number;
}

export class ReportTargetEntity {
  repositoryId!: string;
  branch!: string;
}

export class ReportMetadataEntity {
  startScanTime!: string;
  endScanTime!: string;
  target!: ReportTargetEntity;
}

export class ReportEntity {
  summary?: ReportSummaryEntity;
  data!: ReportDataEntity;
  metadata?: ReportMetadataEntity;
}
