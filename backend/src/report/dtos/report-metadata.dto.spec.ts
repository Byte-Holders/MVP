import 'reflect-metadata';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { ReportTargetDto, ReportMetadataDto } from './report-metadata.dto';

// ReportTargetDto

describe('ReportTargetDto', () => {
  const mockReportTargetDto: object = {
    owner: 'someone',
    repositoryId: 'repo-123',
    branch: 'main',
  };

  it('should pass validation with valid data', async () => {
    const dto = plainToInstance(ReportTargetDto, mockReportTargetDto);
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  describe.each([
    ['owner', 'someone'],
    ['repositoryId', 'repo-123'],
    ['branch', 'main'],
  ])('%s', (field) => {
    it(`should fail if ${field} is empty`, async () => {
      const dto = plainToInstance(ReportTargetDto, {
        ...mockReportTargetDto,
        [field]: '',
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === field)).toBe(true);
    });

    it(`should fail if ${field} is not a string`, async () => {
      const dto = plainToInstance(ReportTargetDto, {
        ...mockReportTargetDto,
        [field]: 123,
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === field)).toBe(true);
    });
  });

  describe('branch', () => {
    it('should fail if branch is missing', async () => {
      const dto = plainToInstance(ReportMetadataDto, {
        ...mockReportTargetDto,
        branch: undefined,
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'branch')).toBe(true);
    });
  });
});

//  ReportMetadataDto

describe('ReportMetadataDto', () => {
  const mockReportMetadataDto: object = {
    startScanTime: '2024-01-01T10:00:00.000Z',
    endScanTime: '2024-01-01T10:05:00.000Z',
    target: {
      repositoryId: 'repo-123',
      branch: 'main',
    },
  };

  it('should pass validation with valid data', async () => {
    const dto = plainToInstance(ReportMetadataDto, mockReportMetadataDto);
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  describe.each([['startScanTime'], ['endScanTime']])('%s', (field) => {
    it(`should fail if ${field} is missing`, async () => {
      const dto = plainToInstance(ReportMetadataDto, {
        ...mockReportMetadataDto,
        [field]: undefined,
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === field)).toBe(true);
    });

    it(`should fail if ${field} is not a valid date string`, async () => {
      const dto = plainToInstance(ReportMetadataDto, {
        ...mockReportMetadataDto,
        [field]: 'not-a-date',
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === field)).toBe(true);
    });
  });

  describe('target', () => {
    it('should fail if target is missing', async () => {
      const dto = plainToInstance(ReportMetadataDto, {
        ...mockReportMetadataDto,
        target: undefined,
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'target')).toBe(true);
    });

    it('should fail if target has an invalid field', async () => {
      const dto = plainToInstance(ReportMetadataDto, {
        ...mockReportMetadataDto,
        target: { repositoryId: '', branch: 'main' },
      });
      const errors = await validate(dto);
      const targetError = errors.find((e) => e.property === 'target');
      expect(
        targetError?.children?.some((c) => c.property === 'repositoryId'),
      ).toBe(true);
    });
  });
});
