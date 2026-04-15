import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { UpdateScanStatusDto } from './update-scan-status.dto';
import { ScanStatus } from '../enums/scan-status.enum';

describe('UpdateScanStatus', () => {
  const mockUpdateScanStatusDto: object = {
    scanId: '1',
    status: ScanStatus.Started,
  };

  it('should pass validation with valid data', async () => {
    const dto = plainToInstance(UpdateScanStatusDto, mockUpdateScanStatusDto);
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  describe('scanId', () => {
    it('should fail if scanId is not a string', async () => {
      const dto = plainToInstance(UpdateScanStatusDto, {
        ...mockUpdateScanStatusDto,
        scanId: 123,
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'scanId')).toBe(true);
    });
  });

  describe('status', () => {
    it('should pass with a valid enum value', async () => {
      const dto = plainToInstance(UpdateScanStatusDto, {
        ...mockUpdateScanStatusDto,
        status: ScanStatus.Completed,
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'status')).toBe(false);
    });

    it('should fail if status is not a valid enum member', async () => {
      const dto = plainToInstance(UpdateScanStatusDto, {
        ...mockUpdateScanStatusDto,
        status: 'invalid-status',
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'status')).toBe(true);
    });

    it('should fail if status is missing', async () => {
      const dto = plainToInstance(UpdateScanStatusDto, {
        ...mockUpdateScanStatusDto,
        status: undefined,
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'status')).toBe(true);
    });

    it('should fail if status is null', async () => {
      const dto = plainToInstance(UpdateScanStatusDto, {
        ...mockUpdateScanStatusDto,
        status: null,
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'status')).toBe(true);
    });

    it('should fail if status is a number', async () => {
      const dto = plainToInstance(UpdateScanStatusDto, {
        ...mockUpdateScanStatusDto,
        status: 123,
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'status')).toBe(true);
    });
  });
});
