import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { UpdateScanStatusFromContainerDto } from './update-scan-status-from-container.dto';
import { ScanStatusUpdateFromContainer } from '../enums/scan-status-update-from-container.enum';

const mockUpdateScanStatusFromContainerDto = (): object => ({
  repositoryId: 'repo-123',
  branch: 'main',
  status: ScanStatusUpdateFromContainer.Completed,
});

describe('UpdateScanStatusFromContainerDto', () => {
  describe('repositoryId', () => {
    it('should pass with a valid string', async () => {
      const dto = plainToInstance(UpdateScanStatusFromContainerDto, {
        ...mockUpdateScanStatusFromContainerDto(),
        repositoryId: 'valid-repo-id',
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'repositoryId')).toBe(false);
    });

    it('should fail if repositoryId is missing', async () => {
      const dto = plainToInstance(UpdateScanStatusFromContainerDto, {
        ...mockUpdateScanStatusFromContainerDto(),
        repositoryId: undefined,
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'repositoryId')).toBe(true);
    });

    it('should fail if repositoryId is not a string', async () => {
      const dto = plainToInstance(UpdateScanStatusFromContainerDto, {
        ...mockUpdateScanStatusFromContainerDto(),
        repositoryId: 123,
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'repositoryId')).toBe(true);
    });
  });

  describe('branch', () => {
    it('should pass with a valid string', async () => {
      const dto = plainToInstance(UpdateScanStatusFromContainerDto, {
        ...mockUpdateScanStatusFromContainerDto(),
        branch: 'develop',
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'branch')).toBe(false);
    });

    it('should fail if branch is missing', async () => {
      const dto = plainToInstance(UpdateScanStatusFromContainerDto, {
        ...mockUpdateScanStatusFromContainerDto(),
        branch: undefined,
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'branch')).toBe(true);
    });

    it('should fail if branch is not a string', async () => {
      const dto = plainToInstance(UpdateScanStatusFromContainerDto, {
        ...mockUpdateScanStatusFromContainerDto(),
        branch: 123,
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'branch')).toBe(true);
    });
  });

  describe('status', () => {
    it('should pass with a valid enum value', async () => {
      // Assicurati di usare un valore effettivo dell'enum
      const validStatus = Object.values(ScanStatusUpdateFromContainer)[0];
      const dto = plainToInstance(UpdateScanStatusFromContainerDto, {
        ...mockUpdateScanStatusFromContainerDto(),
        status: validStatus,
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'status')).toBe(false);
    });

    it('should fail if status is not a valid enum member', async () => {
      const dto = plainToInstance(UpdateScanStatusFromContainerDto, {
        ...mockUpdateScanStatusFromContainerDto(),
        status: 'invalid-status',
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'status')).toBe(true);
    });

    it('should fail if status is missing', async () => {
      const dto = plainToInstance(UpdateScanStatusFromContainerDto, {
        ...mockUpdateScanStatusFromContainerDto(),
        status: undefined,
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'status')).toBe(true);
    });

    it('should fail if status is null', async () => {
      const dto = plainToInstance(UpdateScanStatusFromContainerDto, {
        ...mockUpdateScanStatusFromContainerDto(),
        status: null,
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'status')).toBe(true);
    });

    it('should fail if status is a number', async () => {
      const dto = plainToInstance(UpdateScanStatusFromContainerDto, {
        ...mockUpdateScanStatusFromContainerDto(),
        status: 123,
      });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'status')).toBe(true);
    });
  });

  it('should pass validation with a fully valid object', async () => {
    const dto = plainToInstance(
      UpdateScanStatusFromContainerDto,
      mockUpdateScanStatusFromContainerDto(),
    );
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });
});
