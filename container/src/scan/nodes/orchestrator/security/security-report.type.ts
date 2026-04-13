export type VulnerabilityUnit = {
  id: string;
  path: string;
  description: string;
  remediation: string;
  severity: number;
  impact: string;
  category: string;
  cwe: string[];
  owasp: string[];
};

export type VulnerabilitiesReport = {
  vulnerabilities: VulnerabilityUnit[];
  mark: number;
};
