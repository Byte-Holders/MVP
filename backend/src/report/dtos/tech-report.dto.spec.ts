import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { TechEntryDto, LanguageDto, TechReportDto } from './tech-report.dto';

// TechEntryDto

describe('TechEntryDto', () => {
  const mockTechEntryDto: object = {
    name: 'React',
    version: '18.0.0',
  };

  it('should pass validation with valid data', async () => {
    const dto = plainToInstance(TechEntryDto, mockTechEntryDto);
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  describe.each([
    ['name', 'React'],
    ['version', '18.0.0'],
  ])('%s', (field) => {
    it(`should fail if ${field} is missing`, async () => {
      const dto = plainToInstance(TechEntryDto, {
        ...mockTechEntryDto,
        [field]: undefined,
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === field)).toBe(true);
    });

    it(`should fail if ${field} is empty`, async () => {
      const dto = plainToInstance(TechEntryDto, {
        ...mockTechEntryDto,
        [field]: '',
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === field)).toBe(true);
    });

    it(`should fail if ${field} is not a string`, async () => {
      const dto = plainToInstance(TechEntryDto, {
        ...mockTechEntryDto,
        [field]: 123,
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === field)).toBe(true);
    });
  });
});

// LanguageDto

describe('LanguageDto', () => {
  const mockLanguageDto: object = {
    name: 'TypeScript',
    value: 75,
  };

  it('should pass validation with valid data', async () => {
    const dto = plainToInstance(LanguageDto, mockLanguageDto);
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  describe('name', () => {
    it('should fail if name is missing', async () => {
      const dto = plainToInstance(LanguageDto, {
        ...mockLanguageDto,
        name: undefined,
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'name')).toBe(true);
    });

    it('should fail if name is empty', async () => {
      const dto = plainToInstance(LanguageDto, {
        ...mockLanguageDto,
        name: '',
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'name')).toBe(true);
    });

    it('should fail if name is not a string', async () => {
      const dto = plainToInstance(LanguageDto, {
        ...mockLanguageDto,
        name: 123,
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'name')).toBe(true);
    });
  });

  describe('value', () => {
    it('should fail if value is missing', async () => {
      const dto = plainToInstance(LanguageDto, {
        ...mockLanguageDto,
        value: undefined,
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'value')).toBe(true);
    });

    it('should fail if value is not a number', async () => {
      const dto = plainToInstance(LanguageDto, {
        ...mockLanguageDto,
        value: 'stringa',
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'value')).toBe(true);
    });

    it('should fail if value is below minimum (0)', async () => {
      const dto = plainToInstance(LanguageDto, {
        ...mockLanguageDto,
        value: -1,
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'value')).toBe(true);
    });

    it('should pass with value at boundary (0)', async () => {
      const dto = plainToInstance(LanguageDto, {
        ...mockLanguageDto,
        value: 0,
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'value')).toBe(false);
    });
  });
});

// TechReportDto

describe('TechReportDto', () => {
  const mockTechReportDto: object = {
    libraries: [{ name: 'lodash', version: '4.17.21' }],
    frameworks: [{ name: 'NestJS', version: '10.0.0' }],
    languages: [{ name: 'TypeScript', value: 75 }],
  };

  it('should pass validation with valid data', async () => {
    const dto = plainToInstance(TechReportDto, mockTechReportDto);
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  describe.each([
    //Stesso tipo TechEntryDto
    ['libraries'],
    ['frameworks'],
  ])('%s', (field) => {
    it(`should fail if ${field} is missing`, async () => {
      const dto = plainToInstance(TechReportDto, {
        ...mockTechReportDto,
        [field]: undefined,
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === field)).toBe(true);
    });

    it(`should fail if ${field} is not an array`, async () => {
      const dto = plainToInstance(TechReportDto, {
        ...mockTechReportDto,
        [field]: 'not-an-array',
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === field)).toBe(true);
    });

    it(`should pass with empty ${field} array`, async () => {
      const dto = plainToInstance(TechReportDto, {
        ...mockTechReportDto,
        [field]: [],
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === field)).toBe(false);
    });

    it(`should fail if a ${field} item has an invalid field`, async () => {
      const dto = plainToInstance(TechReportDto, {
        ...mockTechReportDto,
        [field]: [{ name: '', version: '1.0.0' }],
      });
      const errors = await validate(dto);
      const fieldError = errors.find((e) => e.property === field);
      expect(fieldError?.children?.some((c) => c.property === '0')).toBe(true);
    });
  });

  describe('languages', () => {
    it('should fail if languages is missing', async () => {
      const dto = plainToInstance(TechReportDto, {
        ...mockTechReportDto,
        languages: undefined,
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'languages')).toBe(true);
    });

    it('should fail if languages is not an array', async () => {
      const dto = plainToInstance(TechReportDto, {
        ...mockTechReportDto,
        languages: 'not-an-array',
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'languages')).toBe(true);
    });

    it('should pass with empty languages array', async () => {
      const dto = plainToInstance(TechReportDto, {
        ...mockTechReportDto,
        languages: [],
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'languages')).toBe(false);
    });

    it('should fail if a languages item has an invalid field', async () => {
      const dto = plainToInstance(TechReportDto, {
        ...mockTechReportDto,
        languages: [{ name: '', value: 75 }],
      });
      const errors = await validate(dto);
      const langError = errors.find((e) => e.property === 'languages');
      expect(langError?.children?.some((c) => c.property === '0')).toBe(true);
    });
  });
});
