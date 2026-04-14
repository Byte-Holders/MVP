export type CoverageReport = {
  statements: number;
  branches: number;
  functions: number;
  lines: number;
};

export type FailedTest = {
  name: string;
  path: string;
  messageSummary: string;
};

export type TestReport = {
  coverageReport: CoverageReport;
  failedTests: FailedTest[];
  testsRun: number;
};
