// ── Target ────────────────────────────────────────────────────────────────────
export type Target = {
  owner: string;
  repository: string;
  branch?: string;
};

// ── Leaf units ────────────────────────────────────────────────────────────────
export type DepsReportUnit = {
  name: string;
  version: string;
};

export type VulnerabilityUnit = {
  id: string;
  description: string;
  remediation: string;
  severity: number;
};

export type DocsReportUnit = {
  analysis: string;
};

export type CommentDocsUnit = {
  filename: string;
  analysis: string;
};

// ── Section reports ───────────────────────────────────────────────────────────
export type DepsReport = {
  report: DepsReportUnit[];
};

export type VulnerabilitiesReport = {
  vulnerabilities: VulnerabilityUnit[];
};

export type ReadmeReport = {
  analysis: DocsReportUnit;
};

export type DocsReport = {
  readmeReport: ReadmeReport;
  commentReport: CommentDocsUnit[];
  mark: number;
};

export type CoverageReport = {
  statements: number;
  branches: number;
  functions: number;
  lines: number;
};

// ── Final report ──────────────────────────────────────────────────────────────
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
