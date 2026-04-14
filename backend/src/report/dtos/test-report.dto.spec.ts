import 'reflect-metadata';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import {
  CoverageReportDto,
  FailedTestDto,
  TestReportDto,
} from './test-report.dto';

// CoverageReportDto

describe('CoverageReportDto', () => {
  const mockCoverageReportDto: object = {
    statements: 80,
    branches: 75,
    functions: 90,
    lines: 85,
  };

  it('should pass validation with valid data', async () => {
    const dto = plainToInstance(CoverageReportDto, mockCoverageReportDto);
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  describe.each([
    ['statements', 80],
    ['branches', 75],
    ['functions', 90],
    ['lines', 85],
  ])('%s', (field) => {
    it(`should fail if ${field} is missing`, async () => {
      const dto = plainToInstance(CoverageReportDto, {
        ...mockCoverageReportDto,
        [field]: undefined,
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === field)).toBe(true);
    });

    it(`should fail if ${field} is not a number`, async () => {
      const dto = plainToInstance(CoverageReportDto, {
        ...mockCoverageReportDto,
        [field]: 'stringa',
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === field)).toBe(true);
    });

    it(`should fail if ${field} is below minimum (0)`, async () => {
      const dto = plainToInstance(CoverageReportDto, {
        ...mockCoverageReportDto,
        [field]: -1,
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === field)).toBe(true);
    });

    it(`should fail if ${field} is above maximum (100)`, async () => {
      const dto = plainToInstance(CoverageReportDto, {
        ...mockCoverageReportDto,
        [field]: 101,
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === field)).toBe(true);
    });

    it(`should pass with ${field} at boundary values (0 and 100)`, async () => {
      for (const value of [0, 100]) {
        const dto = plainToInstance(CoverageReportDto, {
          ...mockCoverageReportDto,
          [field]: value,
        });
        const errors = await validate(dto);
        expect(errors.some((e) => e.property === field)).toBe(false);
      }
    });
  });
});

//  FailedTestDto

describe('FailedTestDto', () => {
  const mockFailedTestDto: object = {
    name: 'should create a user',
    path: 'src/user/user.service.spec.ts',
    messageSummary: 'Expected 1 but received 0',
  };

  it('should pass validation with valid data', async () => {
    const dto = plainToInstance(FailedTestDto, mockFailedTestDto);
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  describe.each([
    ['name', 'should create a user'],
    ['path', 'src/user/user.service.spec.ts'],
    ['messageSummary', 'Expected 1 but received 0'],
  ])('%s', (field) => {
    it(`should fail if ${field} is missing`, async () => {
      const dto = plainToInstance(FailedTestDto, {
        ...mockFailedTestDto,
        [field]: undefined,
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === field)).toBe(true);
    });

    it(`should fail if ${field} is empty`, async () => {
      const dto = plainToInstance(FailedTestDto, {
        ...mockFailedTestDto,
        [field]: '',
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === field)).toBe(true);
    });

    it(`should fail if ${field} is not a string`, async () => {
      const dto = plainToInstance(FailedTestDto, {
        ...mockFailedTestDto,
        [field]: 123,
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === field)).toBe(true);
    });
  });
});

//  TestReportDto

describe('TestReportDto', () => {
  const mockTestReportDto: object = {
    coverageReport: {
      statements: 80,
      branches: 75,
      functions: 90,
      lines: 85,
    },
    failedTests: [
      {
        name: 'name1',
        path: 'src/user/user.service.spec.ts',
        messageSummary: 'Message',
      },
    ],
    testsRun: 42,
  };

  it('should pass validation with valid data', async () => {
    const dto = plainToInstance(TestReportDto, mockTestReportDto);
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  describe('coverageReport', () => {
    it('should fail if coverageReport is missing', async () => {
      const dto = plainToInstance(TestReportDto, {
        ...mockTestReportDto,
        coverageReport: undefined,
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'coverageReport')).toBe(true);
    });

    it('should fail if coverageReport has an invalid field', async () => {
      const dto = plainToInstance(TestReportDto, {
        ...mockTestReportDto,
        coverageReport: {
          statements: -1,
          branches: 75,
          functions: 90,
          lines: 85,
        },
      });
      const errors = await validate(dto);
      const coverageError = errors.find((e) => e.property === 'coverageReport');
      expect(
        coverageError?.children?.some((c) => c.property === 'statements'),
      ).toBe(true);
    });
  });

  describe('failedTests', () => {
    it('should fail if failedTests is missing', async () => {
      const dto = plainToInstance(TestReportDto, {
        ...mockTestReportDto,
        failedTests: undefined,
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'failedTests')).toBe(true);
    });

    it('should fail if failedTests is not an array', async () => {
      const dto = plainToInstance(TestReportDto, {
        ...mockTestReportDto,
        failedTests: 'not-an-array',
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'failedTests')).toBe(true);
    });

    it('should pass with empty failedTests array', async () => {
      const dto = plainToInstance(TestReportDto, {
        ...mockTestReportDto,
        failedTests: [],
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'failedTests')).toBe(false);
    });

    it('should fail if a failedTests item has an invalid field', async () => {
      const dto = plainToInstance(TestReportDto, {
        ...mockTestReportDto,
        failedTests: [
          { name: '', path: 'src/test.spec.ts', messageSummary: 'error' },
        ],
      });
      const errors = await validate(dto);
      const failedError = errors.find((e) => e.property === 'failedTests');
      expect(failedError?.children?.some((c) => c.property === '0')).toBe(true);
    });
  });

  describe('testsRun', () => {
    it('should fail if testsRun is missing', async () => {
      const dto = plainToInstance(TestReportDto, {
        ...mockTestReportDto,
        testsRun: undefined,
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'testsRun')).toBe(true);
    });

    it('should fail if testsRun is not an integer', async () => {
      const dto = plainToInstance(TestReportDto, {
        ...mockTestReportDto,
        testsRun: 3.5,
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'testsRun')).toBe(true);
    });

    it('should fail if testsRun is below minimum (0)', async () => {
      const dto = plainToInstance(TestReportDto, {
        ...mockTestReportDto,
        testsRun: -1,
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'testsRun')).toBe(true);
    });

    it('should pass with testsRun at boundary (0)', async () => {
      const dto = plainToInstance(TestReportDto, {
        ...mockTestReportDto,
        testsRun: 0,
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'testsRun')).toBe(false);
    });
  });
});
