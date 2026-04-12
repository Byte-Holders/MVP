import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { StartScanDto } from './start-scan.dto';

describe('StartScanDto', () => {
  const validPayload = {
    repositoryId: 'repo-123',
    workspaceId: 'workspace-456',
    branch: 'main',
  };

  it('should pass validation with valid data', async () => {
    const dto = plainToInstance(StartScanDto, validPayload);
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  // repositoryId

  describe('repositoryId', () => {
    it('should fail if repositoryId is missing', async () => {
      const dto = plainToInstance(StartScanDto, { ...validPayload, repositoryId: undefined });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'repositoryId')).toBe(true);
    });

    it('should fail if repositoryId is not a string', async () => {
      const dto = plainToInstance(StartScanDto, { ...validPayload, repositoryId: 123 });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'repositoryId')).toBe(true);
    });
  });

  // workspaceId

  describe('workspaceId', () => {
    it('should fail if workspaceId is missing', async () => {
      const dto = plainToInstance(StartScanDto, { ...validPayload, workspaceId: undefined });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'workspaceId')).toBe(true);
    });

    it('should fail if workspaceId is not a string', async () => {
      const dto = plainToInstance(StartScanDto, { ...validPayload, workspaceId: 123 });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'workspaceId')).toBe(true);
    });
  });

  // branch

  describe('branch', () => {
    it('should fail if branch is missing', async () => {
      const dto = plainToInstance(StartScanDto, { ...validPayload, branch: undefined });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'branch')).toBe(true);
    });

    it('should fail if branch is not a string', async () => {
      const dto = plainToInstance(StartScanDto, { ...validPayload, branch: 123 });
      const errors = await validate(dto);
      expect(errors.some((e) => e.property === 'branch')).toBe(true);
    });
  });
});
