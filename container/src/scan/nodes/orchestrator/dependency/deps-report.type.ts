type DepsReportUnit = {
  name: string;
  version: string;
};

type VulnerabilityUnit = {
  id: string;
  severity: string;
  packageName: string;
  packageVersion: string;
};

export type DepsReport = {
  list: DepsReportUnit[];
  libraries: DepsReportUnit[];
  frameworks: DepsReportUnit[];
  vulnerabilities: VulnerabilityUnit[];
  vulnerabilityAnalysis: string;
};
