import 'reflect-metadata';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import {
  CodeVulnerabilityDto,
  VulnerabilitiesReportDto,
} from './vulnerabilities-report.dto';

// CodeVulnerabilityDto

describe('CodeVulnerabilityDto', () => {
  const mockCodeVulnerabilityDto: object = {
    id: 'vuln-001',
    path: 'src/user/user.service.ts',
    description: 'SQL Injection vulnerability',
    remediation: 'Use parameterized queries',
    severity: 7,
    impact: 'Data breach',
    category: 'Injection',
    cwe: ['CWE-89'],
    owasp: ['A03:2021'],
  };

  it('should pass validation with valid data', async () => {
    const dto = plainToInstance(CodeVulnerabilityDto, mockCodeVulnerabilityDto);
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  describe.each([
    ['id', 'vuln-001'],
    ['path', 'src/user/user.service.ts'],
  ])('%s', (field) => {
    it(`should fail if ${field} is missing`, async () => {
      const dto = plainToInstance(CodeVulnerabilityDto, {
        ...mockCodeVulnerabilityDto,
        [field]: undefined,
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === field)).toBe(true);
    });

    it(`should fail if ${field} is empty`, async () => {
      const dto = plainToInstance(CodeVulnerabilityDto, {
        ...mockCodeVulnerabilityDto,
        [field]: '',
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === field)).toBe(true);
    });

    it(`should fail if ${field} is not a string`, async () => {
      const dto = plainToInstance(CodeVulnerabilityDto, {
        ...mockCodeVulnerabilityDto,
        [field]: 123,
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === field)).toBe(true);
    });
  });

  describe.each([
    ['description', 'SQL Injection vulnerability'],
    ['remediation', 'Use parameterized queries'],
    ['impact', 'Data breach'],
    ['category', 'Injection'],
  ])('%s', (field) => {
    it(`should fail if ${field} is missing`, async () => {
      const dto = plainToInstance(CodeVulnerabilityDto, {
        ...mockCodeVulnerabilityDto,
        [field]: undefined,
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === field)).toBe(true);
    });

    it(`should fail if ${field} is not a string`, async () => {
      const dto = plainToInstance(CodeVulnerabilityDto, {
        ...mockCodeVulnerabilityDto,
        [field]: 123,
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === field)).toBe(true);
    });
  });

  describe('severity', () => {
    it('should fail if severity is missing', async () => {
      const dto = plainToInstance(CodeVulnerabilityDto, {
        ...mockCodeVulnerabilityDto,
        severity: undefined,
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'severity')).toBe(true);
    });

    it('should fail if severity is not a number', async () => {
      const dto = plainToInstance(CodeVulnerabilityDto, {
        ...mockCodeVulnerabilityDto,
        severity: 'stringa',
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'severity')).toBe(true);
    });

    it('should fail if severity is below minimum (0)', async () => {
      const dto = plainToInstance(CodeVulnerabilityDto, {
        ...mockCodeVulnerabilityDto,
        severity: -1,
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'severity')).toBe(true);
    });

    it('should fail if severity is above maximum (10)', async () => {
      const dto = plainToInstance(CodeVulnerabilityDto, {
        ...mockCodeVulnerabilityDto,
        severity: 11,
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'severity')).toBe(true);
    });

    it('should pass with severity at boundary values (0 and 10)', async () => {
      for (const severity of [0, 10]) {
        const dto = plainToInstance(CodeVulnerabilityDto, {
          ...mockCodeVulnerabilityDto,
          severity,
        });
        const errors = await validate(dto);
        expect(errors.some((e) => e.property === 'severity')).toBe(false);
      }
    });
  });

  describe.each([['cwe'], ['owasp']])('%s', (field) => {
    it(`should fail if ${field} is missing`, async () => {
      const dto = plainToInstance(CodeVulnerabilityDto, {
        ...mockCodeVulnerabilityDto,
        [field]: undefined,
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === field)).toBe(true);
    });

    it(`should fail if ${field} is not an array`, async () => {
      const dto = plainToInstance(CodeVulnerabilityDto, {
        ...mockCodeVulnerabilityDto,
        [field]: 'not-an-array',
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === field)).toBe(true);
    });

    it(`should fail if ${field} contains a non-string item`, async () => {
      const dto = plainToInstance(CodeVulnerabilityDto, {
        ...mockCodeVulnerabilityDto,
        [field]: [123],
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === field)).toBe(true);
    });

    it(`should pass with empty ${field} array`, async () => {
      const dto = plainToInstance(CodeVulnerabilityDto, {
        ...mockCodeVulnerabilityDto,
        [field]: [],
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === field)).toBe(false);
    });
  });
});

// VulnerabilitiesReportDto

describe('VulnerabilitiesReportDto', () => {
  const mockVulnerabilitiesReportDto: object = {
    vulnerabilities: [
      {
        id: 'vuln-001',
        path: 'src/user/user.service.ts',
        description: 'SQL Injection vulnerability',
        remediation: 'Use parameterized queries',
        severity: 7,
        impact: 'Data breach',
        category: 'Injection',
        cwe: ['CWE-89'],
        owasp: ['A03:2021'],
      },
    ],
    mark: 6,
  };

  it('should pass validation with valid data', async () => {
    const dto = plainToInstance(
      VulnerabilitiesReportDto,
      mockVulnerabilitiesReportDto,
    );
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  describe('vulnerabilities', () => {
    it('should fail if vulnerabilities is missing', async () => {
      const dto = plainToInstance(VulnerabilitiesReportDto, {
        ...mockVulnerabilitiesReportDto,
        vulnerabilities: undefined,
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'vulnerabilities')).toBe(true);
    });

    it('should fail if vulnerabilities is not an array', async () => {
      const dto = plainToInstance(VulnerabilitiesReportDto, {
        ...mockVulnerabilitiesReportDto,
        vulnerabilities: 'not-an-array',
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'vulnerabilities')).toBe(true);
    });

    it('should pass with empty vulnerabilities array', async () => {
      const dto = plainToInstance(VulnerabilitiesReportDto, {
        ...mockVulnerabilitiesReportDto,
        vulnerabilities: [],
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'vulnerabilities')).toBe(false);
    });

    it('should fail if a vulnerabilities item has an invalid field', async () => {
      const invalidItem = {
        id: '',
        path: 'src/test.ts',
        description: 'desc',
        remediation: 'fix',
        severity: 5,
        impact: 'low',
        category: 'cat',
        cwe: [],
        owasp: [],
      };
      const dto = plainToInstance(VulnerabilitiesReportDto, {
        ...mockVulnerabilitiesReportDto,
        vulnerabilities: [invalidItem],
      });
      const errors = await validate(dto);
      const vulnError = errors.find((e) => e.property === 'vulnerabilities');
      expect(vulnError?.children?.some((c) => c.property === '0')).toBe(true);
    });
  });

  describe('mark', () => {
    it('should fail if mark is missing', async () => {
      const dto = plainToInstance(VulnerabilitiesReportDto, {
        ...mockVulnerabilitiesReportDto,
        mark: undefined,
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'mark')).toBe(true);
    });

    it('should fail if mark is not a number', async () => {
      const dto = plainToInstance(VulnerabilitiesReportDto, {
        ...mockVulnerabilitiesReportDto,
        mark: 'stringa',
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'mark')).toBe(true);
    });

    it('should fail if mark is below minimum (0)', async () => {
      const dto = plainToInstance(VulnerabilitiesReportDto, {
        ...mockVulnerabilitiesReportDto,
        mark: -1,
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'mark')).toBe(true);
    });

    it('should fail if mark is above maximum (10)', async () => {
      const dto = plainToInstance(VulnerabilitiesReportDto, {
        ...mockVulnerabilitiesReportDto,
        mark: 11,
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'mark')).toBe(true);
    });

    it('should pass with mark at boundary values (0 and 10)', async () => {
      for (const mark of [0, 10]) {
        const dto = plainToInstance(VulnerabilitiesReportDto, {
          ...mockVulnerabilitiesReportDto,
          mark,
        });
        const errors = await validate(dto);
        expect(errors.some((e) => e.property === 'mark')).toBe(false);
      }
    });
  });
});
