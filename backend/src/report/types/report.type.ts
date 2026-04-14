export type ReportInfo = {
  summary?: {
    summary: string;
    mark: number;
  };
  data: {
    depsReport: {
      list?: { name: string; version: string }[];
      vulnerabilities: {
        id: string;
        severity: string;
        packageName: string;
        packageVersion: string;
        fixVersion?: string;
      }[];
      vulnerabilityAnalysis: string;
    };
    vulnerabilitiesReport: {
      vulnerabilities: {
        id: string;
        path: string;
        description: string;
        remediation: string;
        severity: number;
        impact: string;
        category: string;
        cwe?: string;
        owasp?: string[];
      }[];
      mark: number;
    };
    docsReport: {
      readmeReport: string;
      commentReport: string;
      mark: number;
    };
    testReport: {
      coverageReport: {
        statements: number;
        branches: number;
        functions: number;
        lines: number;
      };
      failedTests: {
        name: string;
        path: string;
        messageSummary: string;
      }[];
      testsRun: number;
    };
    techReport: {
      libraries: { name: string; version: string }[];
      frameworks: { name: string; version: string }[];
      languages: { name: string; value: number }[];
    };
  };
  metadata?: {
    startScanTime: string;
    endScanTime: string;
    target: {
      repositoryId: string;
      branch: string;
    };
  };
};
