type DepsReportUnit = {
  name: string;
  version: string;
};

type VulnerabilityUnit = {
  id: string;
  severity: string;
  description: string;
  packageName: string;
  packageVersion: string;
  fixVersion: string | undefined;
};

export type DepsReport = {
  list: DepsReportUnit[];
  libraries: DepsReportUnit[];
  frameworks: DepsReportUnit[];
  vulnerabilities: VulnerabilityUnit[];
  vulnerabilityAnalysis: string;
};
