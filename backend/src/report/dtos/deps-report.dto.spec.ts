import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import {
  DependencyDto,
  DepVulnerabilityDto,
  DepsReportDto,
} from './deps-report.dto';

// Mock Factories

const mockDependencyDto = (): object => ({
  name: 'name1',
  version: '1.0.0',
});

const mockDepsVulnerabilityDto = (): object => ({
  id: 'id1',
  severity: '1.0.0',
  packageName: 'package-name1',
  packageVersion: '1.0.0',
});

const mockDepsReportDto = (): object => ({
  list: [mockDependencyDto()],
  vulnerabilities: [mockDepsVulnerabilityDto()],
  vulnerabilityAnalysis: 'No critical vulnerabilities found.',
});

// DependencyDto

describe('DependencyDto', () => {
  it('Should pass validation with valid data', async () => {
    const dto = plainToInstance(DependencyDto, mockDependencyDto());
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });
  describe('name', () => {
    it('should fail if name is missing', async () => {
      const dto = plainToInstance(DependencyDto, {
        ...mockDependencyDto(),
        name: undefined,
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'name')).toBe(true);
    });

    it('should fail if name is empty', async () => {
      const dto = plainToInstance(DependencyDto, {
        ...mockDependencyDto(),
        name: '',
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'name')).toBe(true);
    });

    it('should fail if name is not a string', async () => {
      const dto = plainToInstance(DependencyDto, {
        ...mockDependencyDto(),
        name: 123,
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'name')).toBe(true);
    });
  });

  describe('version', () => {
    it('should fail if version is missing', async () => {
      const dto = plainToInstance(DependencyDto, {
        ...mockDependencyDto(),
        version: undefined,
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'version')).toBe(true);
    });

    it('should fail if version is empty', async () => {
      const dto = plainToInstance(DependencyDto, {
        ...mockDependencyDto(),
        version: '',
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'version')).toBe(true);
    });

    it('should fail if version is not a string', async () => {
      const dto = plainToInstance(DependencyDto, {
        ...mockDependencyDto(),
        version: 123,
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'version')).toBe(true);
    });
  });
});

describe('DepVulnerabilityDto', () => {
  it('should pass validation with valid data', async () => {
    const dto = plainToInstance(
      DepVulnerabilityDto,
      mockDepsVulnerabilityDto(),
    );
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  describe.each([
    ['id', 'vuln-001'],
    ['severity', 'HIGH'],
    ['packageName', 'name1'],
    ['packageVersion', '1.0.0'],
  ])('%s', (field) => {
    it(`should fail if ${field} is missing`, async () => {
      const dto = plainToInstance(DepVulnerabilityDto, {
        ...mockDepsVulnerabilityDto(),
        [field]: undefined,
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === field)).toBe(true);
    });

    it(`should fail if ${field} is empty`, async () => {
      const dto = plainToInstance(DepVulnerabilityDto, {
        ...mockDepsVulnerabilityDto(),
        [field]: '',
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === field)).toBe(true);
    });

    it(`should fail if ${field} is not a string`, async () => {
      const dto = plainToInstance(DepVulnerabilityDto, {
        ...mockDepsVulnerabilityDto(),
        [field]: 123,
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === field)).toBe(true);
    });
  });
});

//  DepsReportDto

describe('DepsReportDto', () => {
  it('should pass validation with valid data', async () => {
    const dto = plainToInstance(DepsReportDto, mockDepsReportDto());
    const errors = await validate(dto, { whitelist: true });
    expect(errors.length).toBe(0);
  });

  // lista

  describe('list', () => {
    it('should pass if list is missing', async () => {
      const dto = plainToInstance(DepsReportDto, {
        ...mockDepsReportDto(),
        list: undefined,
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'list')).toBe(false);
    });

    it('should fail if list is not an array', async () => {
      const dto = plainToInstance(DepsReportDto, {
        ...mockDepsReportDto(),
        list: 'not-an-array',
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'list')).toBe(true);
    });

    it('should pass with an empty list array', async () => {
      const dto = plainToInstance(DepsReportDto, {
        ...mockDepsReportDto(),
        list: [],
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'list')).toBe(false);
    });

    it('should fail if a list item has an invalid name', async () => {
      const invalidList = [{ ...mockDependencyDto(), name: '' }];
      const dto = plainToInstance(DepsReportDto, {
        ...mockDepsReportDto(),
        list: invalidList,
      });
      const errors = await validate(dto, { whitelist: true });
      const listError = errors.find((e) => e.property === 'list');
      expect(listError?.children?.some((c) => c.property === '0')).toBe(true);
    });

    it('should fail if a list item has an invalid version', async () => {
      const invalidList = [{ ...mockDependencyDto(), version: 123 }];
      const dto = plainToInstance(DepsReportDto, {
        ...mockDepsReportDto(),
        list: invalidList,
      });
      const errors = await validate(dto, { whitelist: true });
      const listError = errors.find((e) => e.property === 'list');
      expect(listError?.children?.some((c) => c.property === '0')).toBe(true);
    });
  });

  //  vulnerabilities

  describe('vulnerabilities', () => {
    it('should fail if vulnerabilities is missing', async () => {
      const dto = plainToInstance(DepsReportDto, {
        ...mockDepsReportDto(),
        vulnerabilities: undefined,
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'vulnerabilities')).toBe(true);
    });

    it('should fail if vulnerabilities is not an array', async () => {
      const dto = plainToInstance(DepsReportDto, {
        ...mockDepsReportDto(),
        vulnerabilities: 'not-an-array',
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'vulnerabilities')).toBe(true);
    });

    it('should pass with an empty vulnerabilities array', async () => {
      const dto = plainToInstance(DepsReportDto, {
        ...mockDepsReportDto(),
        vulnerabilities: [],
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'vulnerabilities')).toBe(false);
    });

    it('should fail if a vulnerability item has an invalid field', async () => {
      const invalidVulns = [{ ...mockDepsVulnerabilityDto(), severity: '' }];
      const dto = plainToInstance(DepsReportDto, {
        ...mockDepsReportDto(),
        vulnerabilities: invalidVulns,
      });
      const errors = await validate(dto, { whitelist: true });
      const vulnError = errors.find((e) => e.property === 'vulnerabilities');
      expect(vulnError?.children?.some((c) => c.property === '0')).toBe(true);
    });
  });

  // vulnerabilityAnalysis

  describe('vulnerabilityAnalysis', () => {
    it('should fail if vulnerabilityAnalysis is missing', async () => {
      const dto = plainToInstance(DepsReportDto, {
        ...mockDepsReportDto(),
        vulnerabilityAnalysis: undefined,
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'vulnerabilityAnalysis')).toBe(
        true,
      );
    });

    it('should pass if vulnerabilityAnalysis is empty', async () => {
      const dto = plainToInstance(DepsReportDto, {
        ...mockDepsReportDto(),
        vulnerabilityAnalysis: '',
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'vulnerabilityAnalysis')).toBe(
        false,
      );
    });

    it('should fail if vulnerabilityAnalysis is not a string', async () => {
      const dto = plainToInstance(DepsReportDto, {
        ...mockDepsReportDto(),
        vulnerabilityAnalysis: 123,
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'vulnerabilityAnalysis')).toBe(
        true,
      );
    });
  });
});
