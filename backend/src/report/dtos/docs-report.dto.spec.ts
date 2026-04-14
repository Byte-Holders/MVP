import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { DocsReportDto } from './docs-report.dto';

describe('DocsReportDto', () => {
  const mockDocsReportDto: object = {
    readmeReport: 'Stringa1',
    commentReport: 'Stringa2',
    mark: 10,
  };

  it('should pass validation with valid data', async () => {
    const dto = plainToInstance(DocsReportDto, mockDocsReportDto);
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  describe.each([
    ['readmeReport', 'report'],
    ['commentReport', 'report'],
  ])('%s', (field) => {
    it(`should fail if ${field} is missing`, async () => {
      //Serve?
      const dto = plainToInstance(DocsReportDto, {
        ...mockDocsReportDto,
        [field]: undefined,
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === field)).toBe(true);
    });

    it(`should fail if ${field} is empty`, async () => {
      //Serve?
      const dto = plainToInstance(DocsReportDto, {
        ...mockDocsReportDto,
        [field]: '',
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === field)).toBe(true);
    });

    it(`should fail if ${field} is not a string`, async () => {
      const dto = plainToInstance(DocsReportDto, {
        ...mockDocsReportDto,
        [field]: 123,
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === field)).toBe(true);
    });
  });

  describe('mark', () => {
    it(`should fail if mark is missing`, async () => {
      const dto = plainToInstance(DocsReportDto, {
        ...mockDocsReportDto,
        mark: undefined,
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'mark')).toBe(true);
    });

    it(`should fail if mark is empty`, async () => {
      const dto = plainToInstance(DocsReportDto, {
        ...mockDocsReportDto,
        mark: '',
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'mark')).toBe(true);
    });

    it(`should fail if mark is not a number`, async () => {
      const dto = plainToInstance(DocsReportDto, {
        ...mockDocsReportDto,
        mark: 'stringa',
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'mark')).toBe(true);
    });
    it(`should fail if mark is above maximum (10)`, async () => {
      const dto = plainToInstance(DocsReportDto, {
        ...mockDocsReportDto,
        mark: 11,
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'mark')).toBe(true);
    });
    it(`should fail if mark is below minimum (0)`, async () => {
      const dto = plainToInstance(DocsReportDto, {
        ...mockDocsReportDto,
        mark: -1,
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'mark')).toBe(true);
    });

    it(`should pass if mark is between boundary values (0 to 10)`, async () => {
      for (const value of [0, 10]) {
        const dto = plainToInstance(DocsReportDto, {
          ...mockDocsReportDto,
          mark: value,
        });
        const errors = await validate(dto);
        expect(errors.some((e) => e.property === 'mark')).toBe(false);
      }
    });
  });
});
