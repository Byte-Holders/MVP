type DepsReportUnit = {
  name: string;
  version: string;
};

type VulnerabilityUnit = {
  id: string;
  severity: string;
  packageName: string;
  packageVersion: string;
  fixedInVersion?: string;
};

export type DepsReport = {
  report: DepsReportUnit[];
  vulnerabilities?: VulnerabilityUnit[];
  vulnerabilityAnalysis?: string;
};
