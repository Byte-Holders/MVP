import 'reflect-metadata';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { ReportSummaryDto } from './report-summary.dto';

describe('ReportSummaryDto', () => {
  const mockReportSummaryDto: object = {
    summary: 'Good.',
    mark: 8,
  };

  it('should pass validation with valid data', async () => {
    const dto = plainToInstance(ReportSummaryDto, mockReportSummaryDto);
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  describe('summary', () => {
    it('should fail if summary is missing', async () => {
      const dto = plainToInstance(ReportSummaryDto, {
        ...mockReportSummaryDto,
        summary: undefined,
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'summary')).toBe(true);
    });

    it('should fail if summary is empty', async () => {
      const dto = plainToInstance(ReportSummaryDto, {
        ...mockReportSummaryDto,
        summary: '',
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'summary')).toBe(true);
    });

    it('should fail if summary is not a string', async () => {
      const dto = plainToInstance(ReportSummaryDto, {
        ...mockReportSummaryDto,
        summary: 123,
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'summary')).toBe(true);
    });
  });

  describe('mark', () => {
    it('should fail if mark is missing', async () => {
      const dto = plainToInstance(ReportSummaryDto, {
        ...mockReportSummaryDto,
        mark: undefined,
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'mark')).toBe(true);
    });

    it('should fail if mark is not a number', async () => {
      const dto = plainToInstance(ReportSummaryDto, {
        ...mockReportSummaryDto,
        mark: 'stringa',
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'mark')).toBe(true);
    });

    it('should fail if mark is below minimum (0)', async () => {
      const dto = plainToInstance(ReportSummaryDto, {
        ...mockReportSummaryDto,
        mark: -1,
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'mark')).toBe(true);
    });

    it('should fail if mark is above maximum (10)', async () => {
      const dto = plainToInstance(ReportSummaryDto, {
        ...mockReportSummaryDto,
        mark: 11,
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'mark')).toBe(true);
    });

    it('should pass with mark at boundary values (0 and 10)', async () => {
      for (const mark of [0, 10]) {
        const dto = plainToInstance(ReportSummaryDto, {
          ...mockReportSummaryDto,
          mark,
        });
        const errors = await validate(dto);
        expect(errors.some((e) => e.property === 'mark')).toBe(false);
      }
    });
  });
});
