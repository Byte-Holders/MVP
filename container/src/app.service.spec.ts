/* eslint-disable @typescript-eslint/unbound-method */
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
import { JwtService } from '@nestjs/jwt';
import { Target } from './scan/target.types';

const mockReport = (): Report => ({
  summary: {
    summary: 'mySummary',
    mark: 5,
  },
  data: {
    depsReport: {
      vulnerabilities: [
        {
          id: 'myVulnerabilityId',
          description: 'myVulnerabilityDepDescription1',
          severity: 'HIGH',
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
    },
  },
});

const MOCK_TOKEN = 'myCallbackToken';

const mockDecodedToken = () => ({
  TARGET_OWNER: 'myOwner',
  TARGET_REPOSITORY: 'myRepo',
  TARGET_BRANCH: 'myBranch',
  RECEIVER_URL_SUCCESS: 'http://success.url',
  RECEIVER_URL_FAILURE: 'http://failure.url',
  AWS_ACCESS_KEY_ID: 'myKeyId',
  AWS_SECRET_ACCESS_KEY: 'mySecretKey',
  AWS_SESSION_TOKEN: 'mySessionToken',
  AWS_BEARER_TOKEN_BEDROCK: 'myBedrockToken',
});

describe('AppService', () => {
  let appService: AppService;
  let reporter: jest.Mocked<IReporterService>;
  let scanner: jest.Mocked<IScanService>;
  let configService: jest.Mocked<Pick<ConfigService, 'get' | 'set'>>;
  let jwtService: jest.Mocked<Pick<JwtService, 'decode'>>;

  beforeEach(async () => {
    reporter = {
      sendReport: jest.fn(),
      sendErrorNotification: jest.fn(),
    };

    scanner = {
      scan: jest.fn(),
      validateCredentials: jest.fn(),
    };

    configService = {
      get: jest.fn().mockReturnValue(MOCK_TOKEN),
      set: jest.fn(),
    };

    jwtService = {
      decode: jest.fn().mockReturnValue(mockDecodedToken()),
    };

    const app = await Test.createTestingModule({
      providers: [
        AppService,
        { provide: ISCAN_SERVICE_TOKEN, useValue: scanner },
        { provide: IREPORTER_SERVICE_TOKEN, useValue: reporter },
        { provide: ConfigService, useValue: configService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    appService = app.get<AppService>(AppService);
  });

  it('is defined', () => {
    expect(appService).toBeDefined();
  });

  it('rejects when REPORT_CALLBACK_TOKEN is undefined', async () => {
    configService.get.mockReturnValue(undefined);
    await expect(appService.run()).rejects.toThrow();
  });

  it('rejects when RECEIVER_URL_FAILURE or RECEIVER_URL_SUCCESS are undefined', async () => {
    jwtService.decode
      .mockReturnValueOnce({
        ...mockDecodedToken(),
        RECEIVER_URL_FAILURE: undefined,
      })
      .mockReturnValueOnce({
        ...mockDecodedToken(),
        RECEIVER_URL_SUCCESS: undefined,
      });
    await expect(appService.run()).rejects.toThrow();
    await expect(appService.run()).rejects.toThrow();
  });

  describe('environment variables validation', () => {
    const cases = [
      {
        description: 'TARGET_OWNER is undefined',
        value: { TARGET_OWNER: undefined },
      },
      {
        description: 'TARGET_REPOSITORY is undefined',
        value: { TARGET_REPOSITORY: undefined },
      },
      {
        description: 'TARGET_BRANCH is undefined',
        value: { TARGET_BRANCH: undefined },
      },
      {
        description: 'AWS_ACCESS_KEY_ID is undefined',
        value: { AWS_ACCESS_KEY_ID: undefined },
      },
      {
        description: 'AWS_SECRET_ACCESS_KEY is undefined',
        value: { AWS_SECRET_ACCESS_KEY: undefined },
      },
      {
        description: 'AWS_SESSION_TOKEN is undefined',
        value: { AWS_SESSION_TOKEN: undefined },
      },
      {
        description: 'AWS_BEARER_TOKEN_BEDROCK is undefined',
        value: { AWS_BEARER_TOKEN_BEDROCK: undefined },
      },
    ];

    it.each(cases)(
      'calls sendErrorNotification with RECEIVER_URL_FAILURE and the token if $description',
      async ({ value }) => {
        jwtService.decode.mockReturnValueOnce({
          ...mockDecodedToken(),
          ...value,
        });

        await appService.run();
        expect(reporter.sendErrorNotification).toHaveBeenCalledWith({
          token: MOCK_TOKEN,
          target: mockDecodedToken().RECEIVER_URL_FAILURE,
        });
      },
    );

    it('calls sendErrorNotification with RECEIVER_URL_FAILURE and the token if using invalid AWS credentials', async () => {
      scanner.validateCredentials.mockRejectedValue(new Error());

      await appService.run();

      expect(reporter.sendErrorNotification).toHaveBeenCalledWith({
        token: MOCK_TOKEN,
        target: mockDecodedToken().RECEIVER_URL_FAILURE,
      });
    });

    it('runs a scan on the target (owner, repository, branch) if all the environment variables are set', async () => {
      const target: Target = {
        owner: mockDecodedToken().TARGET_OWNER,
        repository: mockDecodedToken().TARGET_REPOSITORY,
        branch: mockDecodedToken().TARGET_BRANCH,
      };

      await appService.run();
      expect(scanner.scan).toHaveBeenCalledWith(target);
    });
  });

  it('calls sendReport with RECEIVER_URL_SUCCES, the token and the report on a successful scan', async () => {
    const report = mockReport();
    scanner.scan.mockResolvedValue(report);

    await appService.run();

    expect(reporter.sendReport).toHaveBeenCalledWith({
      report,
      token: MOCK_TOKEN,
      target: mockDecodedToken().RECEIVER_URL_SUCCESS,
    });
  });

  it('calls sendErrorNotification with RECEIVER_URL_FAILURE and the token when the scan rejects', async () => {
    scanner.scan.mockRejectedValue(new Error());

    await appService.run();

    expect(reporter.sendErrorNotification).toHaveBeenCalledWith({
      token: MOCK_TOKEN,
      target: mockDecodedToken().RECEIVER_URL_FAILURE,
    });
  });
});
