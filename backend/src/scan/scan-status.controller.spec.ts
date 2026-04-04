import { Test, TestingModule } from '@nestjs/testing';
import { InternalServerErrorException } from '@nestjs/common';
import { ScanStatusController } from './scan-status.controller';
import { ISCAN_STATUS_SERVICE_TOKEN } from './interfaces/iscan-status-service';
import { GetScanStatusDto } from './dtos/get-scan-status.dto';
import { UpdateScanStatusFromContainerDto } from './dtos/update-scan-status-from-container.dto';
import { scanStatus } from './types/scan-status.type';

const makeGetDto = (): GetScanStatusDto => ({
  repositoryId: 'myRepositoryId',
  branch: 'myBranch',
});

const makeUpdateDto = (
  overrides: Partial<UpdateScanStatusFromContainerDto> = {},
): UpdateScanStatusFromContainerDto => ({
  repositoryId: 'myRepositoryId',
  branch: 'myBranch',
  status: 'completed',
  ...overrides,
});

describe('ScanStatusController', () => {
  let controller: ScanStatusController;
  let mockService: { getScanStatus: jest.Mock; setScanStatus: jest.Mock };

  beforeEach(async () => {
    mockService = {
      getScanStatus: jest.fn(),
      setScanStatus: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ScanStatusController],
      providers: [
        { provide: ISCAN_STATUS_SERVICE_TOKEN, useValue: mockService },
      ],
    }).compile();

    controller = module.get<ScanStatusController>(ScanStatusController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getScanStatus', () => {
    it('returns each ScanStatus value', async () => {
      for (const status of scanStatus) {
        mockService.getScanStatus.mockResolvedValue(status);
        const result = await controller.getScanStatus(makeGetDto());
        expect(result).toBe(status);
      }
    });

    it('rejects when the service rejects', async () => {
      mockService.getScanStatus.mockRejectedValue(
        new Error('Error getting scan status'),
      );

      await expect(controller.getScanStatus(makeGetDto())).rejects.toThrow(
        'Error getting scan status',
      );
    });
  });

  describe('update', () => {
    it('can be called on service with the allowed status values', async () => {
      const allowed = ['completed', 'error'] as const;

      for (const status of allowed) {
        await controller.update(makeUpdateDto({ status }));
        expect(mockService.setScanStatus).toHaveReturned();
      }
    });

    it('throws InternalServerErrorException when the service throws', async () => {
      mockService.setScanStatus.mockRejectedValue(
        new Error('Error in service'),
      );

      await expect(controller.update(makeUpdateDto())).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
