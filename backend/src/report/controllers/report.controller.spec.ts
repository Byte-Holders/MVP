import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ReportController } from './report.controller';
import {
  IReportService,
  ReportServiceToken,
} from '../interfaces/ireport.service.interface';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { SaveReportDto, ReportBodyDto } from '../dtos/save-report.dto';
import { ReportDataDto } from '../dtos/report-data.dto';
import type { ReportInfo } from '../types/report.type';

const minimalData: ReportInfo['data'] = {
  depsReport: {
    vulnerabilities: [],
    vulnerabilityAnalysis: '',
  },
  vulnerabilitiesReport: {
    vulnerabilities: [],
    mark: 0,
  },
  docsReport: {
    readmeReport: '',
    commentReport: '',
    mark: 0,
  },
  testReport: {
    coverageReport: { statements: 0, branches: 0, functions: 0, lines: 0 },
    failedTests: [],
    testsRun: 0,
  },
  techReport: {
    libraries: [],
    frameworks: [],
    languages: [],
  },
};

describe('ReportController', () => {
  let controller: ReportController;
  let reportService: jest.Mocked<IReportService>;
  let jwtService: jest.Mocked<JwtService>;

  beforeEach(async () => {
    reportService = {
      saveReport: jest.fn().mockResolvedValue(undefined),
      getReport: jest.fn(),
    };

    jwtService = {
      verifyAsync: jest.fn(),
    } as unknown as jest.Mocked<JwtService>;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReportController],
      providers: [
        { provide: ReportServiceToken, useValue: reportService },
        { provide: JwtService, useValue: jwtService },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: (_ctx: ExecutionContext) => true })
      .compile();

    controller = module.get<ReportController>(ReportController);
  });

  describe('saveReport', () => {
    it('should call reportService.saveReport with mapped ReportInfo on valid token', async () => {
      jwtService.verifyAsync.mockResolvedValue({
        repositoryId: 'repo-1',
        branch: 'main',
      });

      const dto = new SaveReportDto();
      dto.token = 'valid-token';
      const body = new ReportBodyDto();
      body.data = new ReportDataDto();
      Object.assign(body.data, minimalData);
      dto.report = body;

      await controller.saveReport(dto);

      expect(jwtService.verifyAsync).toHaveBeenCalledWith('valid-token');
      expect(reportService.saveReport).toHaveBeenCalledWith(
        expect.objectContaining({
          data: body.data,
          metadata: undefined,
        }),
        dto.token,
      );
    });

    it('should include metadata with repositoryId from token and branch from dto', async () => {
      jwtService.verifyAsync.mockResolvedValue({
        repositoryId: 'repo-42',
        branch: 'ignored',
      });

      const dto = new SaveReportDto();
      dto.token = 'valid-token';
      const body = new ReportBodyDto();
      body.data = new ReportDataDto();
      Object.assign(body.data, minimalData);
      body.metadata = {
        startScanTime: '2024-01-01T00:00:00Z',
        endScanTime: '2024-01-01T01:00:00Z',
        target: {
          branch: 'feature/x',
          owner: 'owner',
          repositoryId: 'ignored',
        },
      } as any;
      dto.report = body;

      await controller.saveReport(dto);

      expect(reportService.saveReport).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: {
            startScanTime: '2024-01-01T00:00:00Z',
            endScanTime: '2024-01-01T01:00:00Z',
            target: { repositoryId: 'repo-42', branch: 'feature/x' },
          },
        }),
        dto.token,
      );
    });

    it('should throw UnauthorizedException when token is invalid', async () => {
      jwtService.verifyAsync.mockRejectedValue(new Error('invalid'));

      const dto = new SaveReportDto();
      dto.token = 'bad-token';
      const body = new ReportBodyDto();
      body.data = new ReportDataDto();
      Object.assign(body.data, minimalData);
      dto.report = body;

      await expect(controller.saveReport(dto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(reportService.saveReport).not.toHaveBeenCalled();
    });
  });

  describe('getReport', () => {
    it('should return the report from reportService', async () => {
      const mockReport: ReportInfo = { data: minimalData };
      reportService.getReport.mockResolvedValue(mockReport);

      const result = await controller.getReport('repo-1', 'main', {
        userId: 'user-1',
      });

      expect(reportService.getReport).toHaveBeenCalledWith(
        'repo-1',
        'main',
        'user-1',
      );
      expect(result).toEqual({ ...mockReport });
    });
  });
});
