/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { ScanManagerController } from './scan-manager.controller';
import {
  ISCAN_MANAGER_SERVICE_TOKEN,
  IScanManagerService,
} from './interfaces/iscan-manager.service';
import { StartScanDto } from './dtos/start-scan.dto';
import { StopScanDto } from './dtos/stop-scan.dto';
import { Scan } from '../entities/scan.entity';
import { ScanStatus } from '../scan-status/enums/scan-status.enum';
import { StartScanResponseDto } from './dtos/start-scan-response.dto';

const mockScan: Scan = {
  id: 'myScanId',
  workspaceId: 'myWorkspace',
  target: { repositoryId: 'myRepositoryId', branchName: 'myBranch' },
  callbackToken: 'myToken',
  startTime: new Date(),
  status: ScanStatus.Started,
  containerRef: 'myContainerRef',
};

const mockStartScanDto: StartScanDto = {
  workspaceId: 'myWorkspaceId',
  repositoryId: 'myRepositoryId',
  branch: 'myBranch',
};

const mockStopScanDto: StopScanDto = {
  scanId: 'myScanId',
};

describe('ScanManagerController', () => {
  let controller: ScanManagerController;
  let mockScanManagerService: jest.Mocked<IScanManagerService>;

  beforeEach(async () => {
    mockScanManagerService = {
      startScan: jest.fn(),
      stopScan: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ScanManagerController],
      providers: [
        {
          provide: ISCAN_MANAGER_SERVICE_TOKEN,
          useValue: mockScanManagerService,
        },
      ],
    }).compile();

    controller = module.get<ScanManagerController>(ScanManagerController);
    jest.clearAllMocks();
  });

  describe('POST / - startScan', () => {
    it('should return the scanId from the created scan', async () => {
      mockScanManagerService.startScan.mockResolvedValue(mockScan);
      const expected: StartScanResponseDto = { scanId: mockScan.id };

      const result = await controller.startScan(mockStartScanDto);

      expect(result).toEqual(expected);
    });

    it('should delegate to the service with the exact DTO once and only once', async () => {
      mockScanManagerService.startScan.mockResolvedValue(mockScan);

      await controller.startScan(mockStartScanDto);

      expect(mockScanManagerService.startScan).toHaveBeenCalledTimes(1);
      expect(mockScanManagerService.startScan).toHaveBeenCalledWith(
        mockStartScanDto,
      );
    });

    it('should reject if the service rejects', async () => {
      mockScanManagerService.startScan.mockRejectedValue(new Error());

      await expect(controller.startScan(mockStartScanDto)).rejects.toThrow();
    });
  });

  describe('PATCH / — stopScan', () => {
    it('should call the service with the correct scanId', async () => {
      mockScanManagerService.stopScan.mockResolvedValue(undefined);

      await controller.stopScan(mockStopScanDto);

      expect(mockScanManagerService.stopScan).toHaveBeenCalledTimes(1);
      expect(mockScanManagerService.stopScan).toHaveBeenCalledWith(
        mockStopScanDto.scanId,
      );
    });

    it('should return undefined', async () => {
      mockScanManagerService.stopScan.mockResolvedValue(undefined);

      const result = await controller.stopScan(mockStopScanDto);

      expect(result).toBeUndefined();
    });

    it('should reject if the service rejects', async () => {
      mockScanManagerService.stopScan.mockRejectedValue(new Error());

      await expect(controller.stopScan(mockStopScanDto)).rejects.toThrow();
    });
  });
});
