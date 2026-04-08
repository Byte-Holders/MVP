import { Test, TestingModule } from '@nestjs/testing';
import { ScanStatusService } from './scan-status.service';
import { ISCAN_REPOSITORY_TOKEN } from '../interfaces/iscan.repository';
import { Scan } from '../entities/scan.entity';
import { ScanStatus } from './enums/scan-status.enum';

const makeScan = (overrides: Partial<Scan> = {}): Scan => ({
  id: 'myScanId',
  workspaceId: 'myWorkspaceId',
  target: { repositoryId: 'myRepositoryId', branchName: 'myBranch' },
  startTime: new Date(0),
  status: ScanStatus.Started,
  containerRef: 'myContainerRef',
  callbackToken: 'myCallbackToken',
  ...overrides,
});

describe('ScanStatusService', () => {
  let service: ScanStatusService;
  let mockRepository: { find: jest.Mock; update: jest.Mock };

  beforeEach(async () => {
    mockRepository = {
      find: jest.fn(),
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
      for (const status of Object.values(ScanStatus)) {
        const scan = makeScan({ status });
        const id = scan.id;

        mockRepository.find.mockResolvedValue(scan);
        const result = await service.getScanStatus(id);
        expect(result).toBe(status);
      }
    });
  });

  describe('setScanStatus', () => {
    it('calls the repository to update each ScanStatus value', async () => {
      for (const originalStatus of Object.values(ScanStatus)) {
        for (const updatedStatus of Object.values(ScanStatus)) {
          const updatedScan = makeScan({ status: updatedStatus });
          const originalScan = makeScan({ status: originalStatus });

          mockRepository.update.mockImplementation(
            (id: string, scan: Partial<Scan>) => ({
              ...scan,
              id: id,
            }),
          );

          await service.setScanStatus(originalScan.id, updatedStatus);
          expect(mockRepository.update).toHaveReturnedWith({
            id: updatedScan.id,
            status: updatedScan.status,
          });
        }
      }
    });
  });
});
