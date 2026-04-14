import 'reflect-metadata';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { SaveReportDto } from './save-report.dto';

describe('SaveReportDto', () => {
  const mockSaveReportData: object = {
    depsReport: {
      list: [{ name: 'name', version: '1.0.0' }],
      vulnerabilities: [],
      vulnerabilityAnalysis: 'No critical vulnerabilities found.',
    },
    vulnerabilitiesReport: {
      vulnerabilities: [],
      mark: 8,
    },
    docsReport: {
      readmeReport: 'Good readme',
      commentReport: 'Well commented',
      mark: 9,
    },
    testReport: {
      coverageReport: {
        statements: 80,
        branches: 75,
        functions: 90,
        lines: 85,
      },
      failedTests: [],
      testsRun: 42,
    },
    techReport: {
      libraries: [],
      frameworks: [],
      languages: [],
    },
  };

  const mockSaveReportDto: object = {
    summary: {
      summary: 'Overall the project is in good shape.',
      mark: 8,
    },
    data: mockSaveReportData,
    metadata: {
      startScanTime: '2024-01-01T10:00:00.000Z',
      endScanTime: '2024-01-01T10:05:00.000Z',
      target: { repositoryId: 'repo-123', branch: 'main' },
    },
  };

  it('should pass validation with valid data', async () => {
    const dto = plainToInstance(SaveReportDto, mockSaveReportDto);
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should pass validation without optional fields (summary and metadata)', async () => {
    const dto = plainToInstance(SaveReportDto, { data: mockSaveReportData });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  describe('data', () => {
    it('should fail if data is missing', async () => {
      const dto = plainToInstance(SaveReportDto, {
        ...mockSaveReportDto,
        data: undefined,
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'data')).toBe(true);
    });

    it('should fail if data is not an object', async () => {
      const dto = plainToInstance(SaveReportDto, {
        ...mockSaveReportDto,
        data: 'not-an-object',
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'data')).toBe(true);
    });

    it('should fail if data has an invalid nested field', async () => {
      const dto = plainToInstance(SaveReportDto, {
        ...mockSaveReportDto,
        data: { ...mockSaveReportData, depsReport: undefined },
      });
      const errors = await validate(dto);
      const dataError = errors.find((e) => e.property === 'data');
      expect(
        dataError?.children?.some((c) => c.property === 'depsReport'),
      ).toBe(true);
    });
  });

  describe('summary (optional)', () => {
    it('should pass if summary is not provided', async () => {
      const { summary, ...withoutSummary } = mockSaveReportDto as any;
      const dto = plainToInstance(SaveReportDto, withoutSummary);
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'summary')).toBe(false);
    });

    it('should fail if summary is provided but has an invalid field', async () => {
      const dto = plainToInstance(SaveReportDto, {
        ...mockSaveReportDto,
        summary: { summary: '', mark: 8 },
      });
      const errors = await validate(dto);
      const summaryError = errors.find((e) => e.property === 'summary');
      expect(
        summaryError?.children?.some((c) => c.property === 'summary'),
      ).toBe(true);
    });
  });

  describe('metadata (optional)', () => {
    it('should pass if metadata is not provided', async () => {
      const { metadata, ...withoutMetadata } = mockSaveReportDto as any;
      const dto = plainToInstance(SaveReportDto, withoutMetadata);
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'metadata')).toBe(false);
    });

    it('should fail if metadata is provided but has an invalid field', async () => {
      const dto = plainToInstance(SaveReportDto, {
        ...mockSaveReportDto,
        metadata: {
          startScanTime: 'not-a-date',
          endScanTime: '2024-01-01T10:05:00.000Z',
          target: { repositoryId: 'repo-123', branch: 'main' },
        },
      });
      const errors = await validate(dto);
      const metadataError = errors.find((e) => e.property === 'metadata');
      expect(
        metadataError?.children?.some((c) => c.property === 'startScanTime'),
      ).toBe(true);
    });
  });
});
