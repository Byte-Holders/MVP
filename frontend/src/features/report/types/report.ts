export interface ReportInfo {
  summary?: {
    summary: string
    mark: number
  }
  data: {
    depsReport: {
      list?: { name: string; version: string }[]
      vulnerabilities: {
        id: string
        severity: string
        description?: string
        packageName: string
        packageVersion: string
        fixVersion?: string
      }[]
      vulnerabilityAnalysis: string
      vulnCounts?: {
        critical: number
        high: number
        medium: number
        low: number
      }
    }
    vulnerabilitiesReport: {
      vulnerabilities: {
        id: string
        path: string
        description: string
        remediation: string
        severity: number
        impact: string
        category: string
        cwe?: string
        owasp?: string[]
      }[]
      mark: number
      vulnCounts?: {
        critical: number
        high: number
        medium: number
        low: number
      }
    }
    docsReport: {
      readmeReport: string
      commentReport: string
      mark: number
    }
    testReport: {
      coverageReport: {
        statements: number
        branches: number
        functions: number
        lines: number
      }
      failedTests: {
        name: string
        path: string
        messageSummary: string
      }[]
      testsRun: number
    }
    techReport: {
      libraries: { name: string; version: string }[]
      frameworks: { name: string; version: string }[]
      languages: { name: string; value: number }[]
    }
  }
  metadata?: {
    startScanTime: string
    endScanTime: string
    target: {
      owner: string
      repository: string
      branch: string
    }
  }
}
