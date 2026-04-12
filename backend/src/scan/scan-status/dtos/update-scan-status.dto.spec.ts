import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { UpdateScanStatusDto } from './update-scan-status.dto';
import { ScanStatus } from '../enums/scan-status.enum';

describe('UpdateScanStatusDto', () => {
  const validPayload = {
    scanId: 'scan-123',
      status: ScanStatus.Completed,
  };

  it('should pass validation with valid data', async () => {
    const dto = plainToInstance(UpdateScanStatusDto, validPayload);
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  //  scanId

  describe('scanId', () => {
    it('should fail if scanId is missing', async () => {
      const dto = plainToInstance(UpdateScanStatusDto, { ...validPayload, scanId: undefined });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'scanId')).toBe(true);
    });

    it('should fail if scanId is not a string', async () => {
      const dto = plainToInstance(UpdateScanStatusDto, { ...validPayload, scanId: 123 });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'scanId')).toBe(true);
    });
  });

  //  status

  describe('status', () => {
    it('should fail if status is missing', async () => {
      const dto = plainToInstance(UpdateScanStatusDto, { ...validPayload, status: undefined });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'status')).toBe(true);
    });

    it('should fail if status is not a valid ScanStatus enum value', async () => {
      const dto = plainToInstance(UpdateScanStatusDto, { ...validPayload, status: 'INVALID_STATUS' });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'status')).toBe(true);
    });

    it('should pass for each valid ScanStatus value', async () => {
      for (const status of Object.values(ScanStatus)) {
        const dto = plainToInstance(UpdateScanStatusDto, { ...validPayload, status });
        const errors = await validate(dto);
        expect(errors.some((e) => e.property === 'status')).toBe(false);
      }
    });
  });
});
