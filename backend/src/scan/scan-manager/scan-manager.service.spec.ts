/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { ECSClient, RunTaskCommand } from '@aws-sdk/client-ecs';
import { ScanManagerService } from './scan-manager.service';
import {
  ISCAN_REPOSITORY_TOKEN,
  type IScanRepository,
} from '../interfaces/iscan.repository';
import {
  RepositoryReaderToken,
  type IRepositoryReader,
} from '../../repository/interfaces/repository.reader.interface';
import { ScanStatus } from '../scan-status/enums/scan-status.enum';
import { type Scan } from '../entities/scan.entity';
import { type StartScanInfo } from './interfaces/iscan-manager.service';

jest.mock('@aws-sdk/client-ecs');

const MOCK_CALLBACK_TOKEN = 'myCallbackToken';
const MOCK_CONTAINER_REF = 'myContainerRef';

const mockRepositoryInfo = {
  repositoryId: 'myRepositoryId',
  ownerName: 'myOwner',
  name: 'myRepositoryName',
};

const mockStartScanInfo: StartScanInfo = {
  workspaceId: 'myWorkspaceId',
  repositoryId: 'myRepositoryId',
  branch: 'myBranch',
};

const mockStartedScan: Scan = {
  id: 'myScanId',
  workspaceId: 'myWorkspaceId',
  target: { repositoryId: 'myRepositoryId', branchName: 'myBranch' },
  callbackToken: MOCK_CALLBACK_TOKEN,
  startTime: new Date(),
  status: ScanStatus.Started,
  containerRef: MOCK_CONTAINER_REF,
};

describe('ScanManagerService', () => {
  let service: ScanManagerService;
  let mockScanRepository: jest.Mocked<IScanRepository>;
  let mockRepositoryReader: jest.Mocked<IRepositoryReader>;
  let mockJwtService: jest.Mocked<Pick<JwtService, 'signAsync'>>;
  let mockEcsSend: jest.Mock;

  beforeEach(async () => {
    mockScanRepository = {
      create: jest.fn(),
      find: jest.fn(),
      findByToken: jest.fn(),
      update: jest.fn(),
    };

    mockRepositoryReader = {
      getRepositories: jest.fn().mockResolvedValue([mockRepositoryInfo]),
    };

    mockJwtService = {
      signAsync: jest.fn().mockResolvedValue(MOCK_CALLBACK_TOKEN),
    };

    mockEcsSend = jest.fn().mockResolvedValue({
      tasks: [{ taskArn: MOCK_CONTAINER_REF }],
    });

    (ECSClient as jest.MockedClass<typeof ECSClient>).mockImplementation(
      () => ({ send: mockEcsSend }) as unknown as ECSClient,
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScanManagerService,
        { provide: ISCAN_REPOSITORY_TOKEN, useValue: mockScanRepository },
        { provide: RepositoryReaderToken, useValue: mockRepositoryReader },
        {
          provide: ConfigService,
          useValue: { get: jest.fn().mockReturnValue('myConfig') },
        },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<ScanManagerService>(ScanManagerService);
  });

  describe('startScan', () => {
    it('should sign the callback token with the owner, repository, branch and repositoryId', async () => {
      await service.startScan(mockStartScanInfo);

      expect(mockJwtService.signAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          TARGET_OWNER: mockRepositoryInfo.ownerName,
          TARGET_REPOSITORY: mockRepositoryInfo.name,
          TARGET_BRANCH: mockStartScanInfo.branch,
          repositoryId: mockStartScanInfo.repositoryId,
        }),
      );
    });

    it('should pass the callbackToken as REPORT_CALLBACK_TOKEN in the container environment override', async () => {
      await service.startScan(mockStartScanInfo);

      expect(RunTaskCommand).toHaveBeenCalledWith(
        expect.objectContaining({
          overrides: {
            containerOverrides: [
              expect.objectContaining({
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                environment: expect.arrayContaining([
                  { name: 'REPORT_CALLBACK_TOKEN', value: MOCK_CALLBACK_TOKEN },
                ]),
              }),
            ],
          },
        }),
      );
    });

    it('should spawn exactly one container', async () => {
      await service.startScan(mockStartScanInfo);

      expect(mockEcsSend).toHaveBeenCalledTimes(1);
      expect(RunTaskCommand).toHaveBeenCalledWith(
        expect.objectContaining({ count: 1 }),
      );
    });

    it('should reject if the ECS send command throws', async () => {
      mockEcsSend.mockRejectedValue(new Error());

      await expect(service.startScan(mockStartScanInfo)).rejects.toThrow();
    });

    it('should call scanRepository.create with the correct Scan values', async () => {
      await service.startScan(mockStartScanInfo);

      expect(mockScanRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          workspaceId: mockStartScanInfo.workspaceId,
          target: {
            repositoryId: mockStartScanInfo.repositoryId,
            branchName: mockStartScanInfo.branch,
          },
          callbackToken: MOCK_CALLBACK_TOKEN,
          status: ScanStatus.Started,
          containerRef: MOCK_CONTAINER_REF,
        }),
      );
    });

    it('should return the same scan value that was passed to the repository', async () => {
      const result = await service.startScan(mockStartScanInfo);

      const [persistedScan] = mockScanRepository.create.mock.calls[0];
      expect(result).toBe(persistedScan);
    });
  });

  describe('stopScan', () => {
    it('should reject if the scan is not found in the repository', async () => {
      mockScanRepository.find.mockResolvedValue(null);

      await expect(service.stopScan('placeholder')).rejects.toThrow();
    });

    it('should reject if the scan exists but is already in a non-started status', async () => {
      mockScanRepository.find.mockResolvedValue({
        ...mockStartedScan,
        status: ScanStatus.Completed,
      });

      await expect(service.stopScan('placeholder')).rejects.toThrow();
    });

    it('should reject if the ECS send command rejects', async () => {
      mockScanRepository.find.mockResolvedValue(mockStartedScan);
      mockEcsSend.mockRejectedValue(new Error());

      await expect(service.stopScan(mockStartedScan.id)).rejects.toThrow();
    });

    it('should call scanRepository.update with the scan id and the scan in stopped status', async () => {
      mockScanRepository.find.mockResolvedValue(mockStartedScan);

      await service.stopScan(mockStartedScan.id);

      expect(mockScanRepository.update).toHaveBeenCalledWith(
        mockStartedScan.id,
        { ...mockStartedScan, status: ScanStatus.Stopped },
      );
    });
  });
});
