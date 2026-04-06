export type VulnerabilityUnit = {
  id: string;
  description: string;
  remediation: string;
  severity: number;
};

export type VulnerabilitiesReport = {
  vulnerabilities: VulnerabilityUnit[];
  mark?: number;
};
