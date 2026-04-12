import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { UpdateScanStatusFromContainerDto } from './update-scan-status-from-container.dto';
import { ScanStatusUpdateFromContainer } from '../enums/scan-status-update-from-container.enum';

describe('UpdateScanStatusFromContainerDto', () => {
  const validPayload = {
    repositoryId: 'repo-123',
    branch: 'main',
    status: ScanStatusUpdateFromContainer.Completed,
  };

  it('should pass validation with valid data', async () => {
    const dto = plainToInstance(UpdateScanStatusFromContainerDto, validPayload);
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  // repositoryId

  describe('repositoryId', () => {
    it('should fail if repositoryId is missing', async () => {
      const dto = plainToInstance(UpdateScanStatusFromContainerDto, { ...validPayload, repositoryId: undefined });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'repositoryId')).toBe(true);
    });

    it('should fail if repositoryId is not a string', async () => {
      const dto = plainToInstance(UpdateScanStatusFromContainerDto, { ...validPayload, repositoryId: 123 });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'repositoryId')).toBe(true);
    });
  });

  //  branch

  describe('branch', () => {
    it('should fail if branch is missing', async () => {
      const dto = plainToInstance(UpdateScanStatusFromContainerDto, { ...validPayload, branch: undefined });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'branch')).toBe(true);
    });

    it('should fail if branch is not a string', async () => {
      const dto = plainToInstance(UpdateScanStatusFromContainerDto, { ...validPayload, branch: 123 });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'branch')).toBe(true);
    });
  });

  //  status

  describe('status', () => {
    it('should fail if status is missing', async () => {
      const dto = plainToInstance(UpdateScanStatusFromContainerDto, { ...validPayload, status: undefined });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'status')).toBe(true);
    });

    it('should fail if status is not a valid ScanStatusUpdateFromContainer enum value', async () => {
      const dto = plainToInstance(UpdateScanStatusFromContainerDto, { ...validPayload, status: 'INVALID_STATUS' });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'status')).toBe(true);
    });

    it('should pass for each valid ScanStatusUpdateFromContainer value', async () => {
      for (const status of Object.values(ScanStatusUpdateFromContainer)) {
        const dto = plainToInstance(UpdateScanStatusFromContainerDto, { ...validPayload, status });
        const errors = await validate(dto);
        expect(errors.some((e) => e.property === 'status')).toBe(false);
      }
    });
  });
});
