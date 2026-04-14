import { Test } from '@nestjs/testing';
import { AppService } from './app.service';
import {
  IREPORTER_SERVICE_TOKEN as IREPORTER_SERVICE_TOKEN,
  IReporterService,
} from './reporter/ireporter-service.interface';
import {
  ISCAN_SERVICE_TOKEN,
  IScanService,
} from './scan/iscan-service.interface';
import { Report } from './scan/nodes/orchestrator/synthesizer/synthesizer.types';
import { ConfigService } from '@nestjs/config';

const makeReport = (...overrides: any[]): Report => ({
  summary: {
    summary: 'mySummary',
    mark: 5,
  },
  data: {
    depsReport: {
      vulnerabilities: [
        {
          id: 'myVulnerabilityId',
          severity: 'HIGH',
          description: 'myVulnerabilityDescription',
          packageName: 'myPackageName',
          packageVersion: 'myPackageVersion',
          fixVersion: undefined,
        },
      ],
      vulnerabilityAnalysis: 'myShortSummaryForVulnerabilityAnalysis',
    },
    vulnerabilitiesReport: {
      vulnerabilities: [
        {
          id: 'myVulnerabilityId1',
          path: 'myPath/myFile',
          description: 'myVulnerabilityDescription1',
          remediation: 'myVulnerabilityRemediation1',
          severity: 5,
          impact: 'MEDIUM',
          category: 'myVulnerabilityCategory1',
          cwe: ['CWE-0-0'],
          owasp: ['OWASP-top-10-2025'],
        },
        {
          id: 'myVulnerabilityId2',
          path: 'myPath/myFile',
          description: 'myVulnerabilityDescription2',
          remediation: 'myVulnerabilityRemediation2',
          severity: 10,
          impact: 'LOW',
          category: 'myVulnerabilityCategory',
          cwe: ['CWE-0-0'],
          owasp: ['OWASP-top-10-2025'],
        },
      ],
      mark: 2,
    },
    docsReport: {
      readmeReport: 'myReadmeReport',
      commentReport: 'myCommentReport',
      mark: 4,
    },
    testReport: {
      coverageReport: {
        statements: 15,
        branches: 20,
        functions: 11,
        lines: 90,
      },
      failedTests: [
        {
          name: 'myTest1',
          path: 'myPath/myTest',
          messageSummary: 'myMessage',
        },
      ],
      testsRun: 72,
    },
    techReport: {
      libraries: [
        {
          name: 'myLibrary1',
          version: 'myLibVersion1',
        },
        {
          name: 'myLibrary2',
          version: 'myLibVersion2',
        },
      ],
      frameworks: [
        {
          name: 'myFramework1',
          version: 'myFrameworkVersion1',
        },
        {
          name: 'myFramework2',
          version: 'myFrameworkVersion2',
        },
      ],
      languages: [
        {
          name: 'Python',
          value: 20,
        },
        {
          name: 'TypeScript',
          value: 80,
        },
      ],
    },
  },
  metadata: {
    startScanTime: new Date(0),
    endScanTime: new Date(10),
    target: {
      owner: 'myTargetOwner',
      repository: 'myTargetRepository',
      branch: 'myTargetBranch',
      repositoryId: 'myRepositoryId',
    },
  },
  ...overrides,
});

describe('AppService', () => {
  let appService: AppService;
  let reporter: jest.Mocked<IReporterService>;
  let scanner: jest.Mocked<IScanService>;

  beforeEach(async () => {
    reporter = {
      sendReport: jest.fn(),
    };

    scanner = {
      scan: jest.fn(),
    };

    const app = await Test.createTestingModule({
      providers: [
        AppService,
        { provide: ISCAN_SERVICE_TOKEN, useValue: scanner },
        { provide: IREPORTER_SERVICE_TOKEN, useValue: reporter },
        ConfigService,
      ],
    }).compile();

    appService = app.get<AppService>(AppService);
  });

  it('is defined', () => {
    expect(appService).toBeDefined();
  });
});
