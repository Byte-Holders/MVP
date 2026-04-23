import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { GetScanStatusDto } from './get-scan-status.dto';

describe('GetScanStatus', () => {
  const mockGetScanStatus: object = {
    scanId: '1',
  };

  it('should pass validation with valid data', async () => {
    const dto = plainToInstance(GetScanStatusDto, mockGetScanStatus);
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  describe('scanId', () => {
    it('should fail if scanId is not a string', async () => {
      const dto = plainToInstance(GetScanStatusDto, {
        ...mockGetScanStatus,
        scanId: 123,
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'scanId')).toBe(true);
    });
  });
});
