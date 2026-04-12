import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ScanRepository } from './scan.repository';
import { ScanSchemaClass } from './schemas/scan.schema';
import { Scan } from './entities/scan.entity';
import { ScanStatus } from './scan-status/enums/scan-status.enum';
import { ScanTarget } from './entities/scan-target.entity';

const mockTarget: ScanTarget = {
  repositoryId: "123",
  branchName: "1",
} as ScanTarget;

const mockScan: Scan = {
  id: 'test-id-123',
  workspaceId: 'workspace-456',
  target: mockTarget,
  callbackToken: 'callback-token-abc',
  startTime: new Date('2024-01-01T10:00:00Z'),
  endTime: new Date('2024-01-01T10:05:00Z'),
  status: ScanStatus.Completed,
  containerRef: 'container-ref-xyz',
};

const mockScanModel = {
  create: jest.fn(),
  findOne: jest.fn(),
  findOneAndUpdate: jest.fn(),
};

describe('ScanRepository', () => {
  let repository: ScanRepository;
  let model: Model<Scan>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScanRepository,
        {
          provide: getModelToken(ScanSchemaClass.name),
          useValue: mockScanModel,
        },
      ],
    }).compile();

    repository = module.get<ScanRepository>(ScanRepository);
    model = module.get<Model<Scan>>(getModelToken(ScanSchemaClass.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  // create

  describe('create', () => {
    it('should create and return a new scan', async () => {
      mockScanModel.create.mockResolvedValue(mockScan);

      const result = await repository.create(mockScan);

      expect(mockScanModel.create).toHaveBeenCalledWith(mockScan);
      expect(mockScanModel.create).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockScan);
    });

    it('should propagate an error if create fails', async () => {
      mockScanModel.create.mockRejectedValue(new Error('DB error'));

      await expect(repository.create(mockScan)).rejects.toThrow('DB error');
    });
  });

  //  find

  describe('find', () => {
    it('should return an existing scan given its id', async () => {
      const leanExecMock = {
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockScan),
      };
      mockScanModel.findOne.mockReturnValue(leanExecMock);

      const result = await repository.find('test-id-123');

      expect(mockScanModel.findOne).toHaveBeenCalledWith({ id: 'test-id-123' });
      expect(result).toEqual(mockScan);
    });

    it('should return null if the scan does not exist', async () => {
      const leanExecMock = {
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null),
      };
      mockScanModel.findOne.mockReturnValue(leanExecMock);

      const result = await repository.find('id-inesistente');

      expect(result).toBeNull();
    });

    it('should propagate an error if findOne fails', async () => {
      const leanExecMock = {
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockRejectedValue(new Error('DB error')),
      };
      mockScanModel.findOne.mockReturnValue(leanExecMock);

      await expect(repository.find('test-id-123')).rejects.toThrow('DB error');
    });
  });

  //  update

  describe('update', () => {
    it('should update and return the modified scan', async () => {
      const updatedScan: Partial<Scan> = { ...mockScan, id: 'test-id-123' };
      const execMock = { exec: jest.fn().mockResolvedValue(updatedScan) };
      mockScanModel.findOneAndUpdate.mockReturnValue(execMock);

      const result = await repository.update('test-id-123', updatedScan);

      expect(mockScanModel.findOneAndUpdate).toHaveBeenCalledWith(
        { id: 'test-id-123' },
        updatedScan,
        { returnDocument: 'after' },
      );
      expect(result).toEqual(updatedScan);
    });

    it('should return null if the scan to update does not exist', async () => {
      const execMock = { exec: jest.fn().mockResolvedValue(null) };
      mockScanModel.findOneAndUpdate.mockReturnValue(execMock);

      const result = await repository.update('id-inesistente', {});

      expect(result).toBeNull();
    });

    it('should propagate an error if findOneAndUpdate fails', async () => {
      const execMock = {
        exec: jest.fn().mockRejectedValue(new Error('DB error')),
      };
      mockScanModel.findOneAndUpdate.mockReturnValue(execMock);

      await expect(repository.update('test-id-123', {})).rejects.toThrow(
        'DB error',
      );
    });
  });
});
