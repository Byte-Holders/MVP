import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { GetScanStatusDto } from './get-scan-status.dto';

describe('GetScanStatusDto', () => {
  const validPayload = {
    scanId: 'scan-123',
  };

  it('should pass validation with valid data', async () => {
    const dto = plainToInstance(GetScanStatusDto, validPayload);
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  describe('scanId', () => {
    it('should fail if scanId is missing', async () => {
      const dto = plainToInstance(GetScanStatusDto, { ...validPayload, scanId: undefined });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'scanId')).toBe(true);
    });

    it('should fail if scanId is not a string', async () => {
      const dto = plainToInstance(GetScanStatusDto, { ...validPayload, scanId: 123 });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'scanId')).toBe(true);
    });
  });
});
