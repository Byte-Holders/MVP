import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ReportService } from './report.service';
import { ReportRepositoryToken } from '../interfaces/ireport.repository.interface';
import type { ReportInfo } from '../types/report.type';

const makeReport = (...overrides: any[]): ReportInfo => ({
  summary: {
    summary: 'mySummary',
    mark: 5,
  },
  data: {
    depsReport: {
      list: [
        { name: 'myDepName1', version: '1.0.0' },
        { name: 'myDepName2', version: '0.0.1' },
      ],
      vulnerabilities: [
        {
          id: 'myVulnerabilityId',
          severity: 'HIGH',
          packageName: 'myPackageName',
          packageVersion: 'myPackageVersion',
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
        { name: 'myLibrary1', version: 'myLibVersion1' },
        { name: 'myLibrary2', version: 'myLibVersion2' },
      ],
      frameworks: [
        { name: 'myFramework1', version: 'myFrameworkVersion1' },
        { name: 'myFramework2', version: 'myFrameworkVersion2' },
      ],
      languages: [
        { name: 'Python', value: 20 },
        { name: 'TypeScript', value: 80 },
      ],
    },
  },
  metadata: {
    startScanTime: new Date(0).toISOString(),
    endScanTime: new Date(10).toISOString(),
    target: {
      owner: 'myTargetOwner',
      repository: 'myTargetRepository',
      branch: 'myTargetBranch',
    },
  },
  ...overrides,
});

describe('ReportService', () => {
  let service: ReportService;
  let mockRepository: {
    save: jest.Mock;
    findLatestByTarget: jest.Mock;
  };

  beforeEach(async () => {
    mockRepository = {
      save: jest.fn(),
      findLatestByTarget: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportService,
        { provide: ReportRepositoryToken, useValue: mockRepository },
      ],
    }).compile();

    service = module.get<ReportService>(ReportService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('saveReport', () => {
    it('delegates to the repository', async () => {
      const report = makeReport();
      mockRepository.save.mockResolvedValue(report);

      await service.saveReport(report);

      expect(mockRepository.save).toHaveBeenCalledWith({
        summary: report.summary,
        data: report.data,
        metadata: report.metadata,
      });
    });
  });

  describe('getReport', () => {
    it('returns the report when found', async () => {
      const report = makeReport();
      const { owner, repository, branch } = report.metadata!.target;
      mockRepository.findLatestByTarget.mockResolvedValue(report);

      const result = await service.getReport(owner, repository, branch);

      expect(result).toEqual({
        summary: report.summary,
        data: report.data,
        metadata: report.metadata,
      });
    });

    it('throws NotFoundException when report is not found', async () => {
      mockRepository.findLatestByTarget.mockResolvedValue(null);

      await expect(service.getReport('owner', 'repo', 'main')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
