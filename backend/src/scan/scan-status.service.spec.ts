import { Test, TestingModule } from '@nestjs/testing';
import { ScanStatusService } from './scan-status.service';
import { ISCAN_REPOSITORY_TOKEN } from './interfaces/iscan.repository';
import { GetScanStatusDto } from './dtos/get-scan-status.dto';
import { UpdateScanStatusDto } from './dtos/update-scan-status.dto';
import { Scan } from './schemas/scan.schema';
import { scanStatus } from './types/scan-status.type';

const makeScan = (overrides: Partial<Scan> = {}): Scan => ({
  target: {
    workspace: 'myWorkspace',
    repository: 'myRepository',
    branch: 'myBranch',
  },
  startTime: new Date(0),
  status: 'started',
  ...overrides,
});

const makeGetDto = (): GetScanStatusDto => ({
  repositoryId: 'myRepositoryId',
  branch: 'myBranch',
});

const makeUpdateDto = (overrides: Partial<Scan> = {}): UpdateScanStatusDto => ({
  repositoryId: 'myRepositoryId',
  branch: 'myBranch',
  status: 'started',
  ...overrides,
});

describe('ScanStatusService', () => {
  let service: ScanStatusService;
  let mockRepository: { get: jest.Mock; update: jest.Mock };

  beforeEach(async () => {
    mockRepository = {
      get: jest.fn(),
      update: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScanStatusService,
        { provide: ISCAN_REPOSITORY_TOKEN, useValue: mockRepository },
      ],
    }).compile();

    service = module.get<ScanStatusService>(ScanStatusService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getScanStatus', () => {
    it('returns each ScanStatus value', async () => {
      for (const status of scanStatus) {
        mockRepository.get.mockResolvedValue(makeScan({ status }));
        const result = await service.getScanStatus(makeGetDto());
        expect(result).toBe(status);
      }
    });

    it('throws when the repository throws', async () => {
      mockRepository.get.mockRejectedValue(
        new Error('Error getting scan from database'),
      );

      await expect(service.getScanStatus(makeGetDto())).rejects.toThrow(
        'Error getting scan from database',
      );
    });
  });

  describe('setScanStatus', () => {
    it('calls the repository with the right parameter', async () => {
      for (const status of scanStatus) {
        await service.setScanStatus(makeUpdateDto({ status }));
        expect(mockRepository.update).toHaveBeenCalledWith(
          makeUpdateDto({ status }),
        );
      }
    });
  });
});
