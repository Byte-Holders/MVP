export type VulnerabilityUnit = {
  id: string;
  description: string;
  remediation: string;
  severity: number;
  category: string;
  cwe: string[];
  owasp: string[];
};

export type VulnerabilitiesReport = {
  vulnerabilities: VulnerabilityUnit[];
  mark: number;
};
