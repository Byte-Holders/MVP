import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ReportService } from './report.service';
import { ReportRepositoryToken } from '../interfaces/ireport.repository.interface';
import { RepositoryScoreWriterToken } from '../../repository/interfaces/repository.score-writer.interface';
import { IUserRoleReaderToken } from '../../workspace/workspaceUser/interfaces/IUserRoleReader';
import { WorkspaceRole } from '../../workspace/roles.enum';
import type { ReportInfo } from '../types/report.type';
import {
  ISCAN_STATUS_SERVICE_TOKEN,
  type IScanStatusService,
} from '../../scan/scan-status/interfaces/iscan-status.service';
import { ScanStatus } from '../../scan/scan-status/enums/scan-status.enum';

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
          cwe: 'CWE-0-0',
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
          cwe: 'CWE-0-0',
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
      repositoryId: 'myTargetRepositoryId',
      branch: 'myTargetBranch',
    },
  },
  ...overrides,
});

const MOCK_TOKEN = 'myToken';

describe('ReportService', () => {
  let service: ReportService;
  let mockRepository: {
    saveReport: jest.Mock;
    getReport: jest.Mock;
  };
  let mockWorkspaceUserService: { getUserRoleForRepository: jest.Mock };
  let mockScanStatusService: jest.Mocked<IScanStatusService>;

  beforeEach(async () => {
    mockRepository = {
      saveReport: jest.fn(),
      getReport: jest.fn(),
    };
    mockWorkspaceUserService = {
      getUserRoleForRepository: jest.fn().mockResolvedValue(null),
    };
    mockScanStatusService = {
      getScanStatus: jest.fn(),
      setScanStatus: jest.fn(),
      setScanStatusFromToken: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportService,
        { provide: ReportRepositoryToken, useValue: mockRepository },
        {
          provide: RepositoryScoreWriterToken,
          useValue: { updateScores: jest.fn() },
        },
        {
          provide: IUserRoleReaderToken,
          useValue: mockWorkspaceUserService,
        },
        {
          provide: ISCAN_STATUS_SERVICE_TOKEN,
          useValue: mockScanStatusService,
        },
      ],
    }).compile();

    service = module.get<ReportService>(ReportService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('saveReport', () => {
    it('updates the scan status with Completed Status and delegates to the repository', async () => {
      const report = makeReport();
      mockRepository.saveReport.mockResolvedValue(report);

      await service.saveReport(report, MOCK_TOKEN);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockScanStatusService.setScanStatusFromToken).toHaveBeenCalledWith(
        MOCK_TOKEN,
        ScanStatus.Completed,
      );

      expect(mockRepository.saveReport).toHaveBeenCalledWith({
        summary: report.summary,
        data: report.data,
        metadata: report.metadata,
      });
    });

    it('does not save the new report if the scan status rejects', async () => {
      mockScanStatusService.setScanStatusFromToken.mockRejectedValue(
        new Error(),
      );

      await expect(
        service.saveReport(makeReport(), MOCK_TOKEN),
      ).rejects.toThrow();

      expect(mockRepository.saveReport).not.toHaveBeenCalled();
    });
  });

  describe('getReport', () => {
    it('returns full report with vulnCounts for non-PM users', async () => {
      const report = makeReport();
      const { repositoryId, branch } = report.metadata!.target;
      mockRepository.getReport.mockResolvedValue(report);
      mockWorkspaceUserService.getUserRoleForRepository.mockResolvedValue(
        WorkspaceRole.TECH_LEAD,
      );

      const result = await service.getReport(repositoryId, branch, 'user-1');

      expect(result.data.depsReport.list).toEqual(report.data.depsReport.list);
      expect(result.data.depsReport.vulnerabilities).toEqual(
        report.data.depsReport.vulnerabilities,
      );
      expect(result.data.depsReport.vulnCounts).toEqual({
        critical: 0,
        high: 1,
        medium: 0,
        low: 0,
      });
      expect(result.data.vulnerabilitiesReport.vulnerabilities).toEqual(
        report.data.vulnerabilitiesReport.vulnerabilities,
      );
      expect(result.data.vulnerabilitiesReport.vulnCounts).toEqual({
        critical: 0,
        high: 0,
        medium: 1,
        low: 1,
      });
    });

    it('hides dep list and vuln lists for PROJECT_MANAGER but keeps counts and marks', async () => {
      const report = makeReport();
      const { repositoryId, branch } = report.metadata!.target;
      mockRepository.getReport.mockResolvedValue(report);
      mockWorkspaceUserService.getUserRoleForRepository.mockResolvedValue(
        WorkspaceRole.PROJECT_MANAGER,
      );

      const result = await service.getReport(repositoryId, branch, 'pm-user');

      expect(result.data.depsReport.list).toBeUndefined();
      expect(result.data.depsReport.vulnerabilities).toEqual([]);
      expect(result.data.depsReport.vulnCounts).toEqual({
        critical: 0,
        high: 1,
        medium: 0,
        low: 0,
      });
      expect(result.data.vulnerabilitiesReport.vulnerabilities).toEqual([]);
      expect(result.data.vulnerabilitiesReport.mark).toBe(
        report.data.vulnerabilitiesReport.mark,
      );
      expect(result.data.vulnerabilitiesReport.vulnCounts).toEqual({
        critical: 0,
        high: 0,
        medium: 1,
        low: 1,
      });
    });

    it('returns full report with vulnCounts when user has no workspace role', async () => {
      const report = makeReport();
      const { repositoryId, branch } = report.metadata!.target;
      mockRepository.getReport.mockResolvedValue(report);
      mockWorkspaceUserService.getUserRoleForRepository.mockResolvedValue(null);

      const result = await service.getReport(repositoryId, branch, 'user-x');

      expect(result.data.depsReport.vulnerabilities).toEqual(
        report.data.depsReport.vulnerabilities,
      );
      expect(result.data.depsReport.vulnCounts).toBeDefined();
      expect(result.data.vulnerabilitiesReport.vulnerabilities).toEqual(
        report.data.vulnerabilitiesReport.vulnerabilities,
      );
      expect(result.data.vulnerabilitiesReport.vulnCounts).toBeDefined();
    });

    it('throws NotFoundException when report is not found', async () => {
      mockRepository.getReport.mockResolvedValue(null);

      await expect(
        service.getReport('myRepositoryId', 'main', 'user-1'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
