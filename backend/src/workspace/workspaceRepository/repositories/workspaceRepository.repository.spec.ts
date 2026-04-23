import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { WorkspaceRepositoryRepository } from './workspaceRepository.repository';
import { Workspace } from '../../schemas/workspace.schema';

describe('WorkspaceRepositoryRepository', () => {
  let repository: WorkspaceRepositoryRepository;

  const mockWorkspaceModel = {
    findById: jest.fn(),
    updateOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkspaceRepositoryRepository,
        {
          provide: getModelToken(Workspace.name),
          useValue: mockWorkspaceModel,
        },
      ],
    }).compile();

    repository = module.get<WorkspaceRepositoryRepository>(
      WorkspaceRepositoryRepository,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getRepositories', () => {
    it('should return an array of repository string IDs', async () => {
      const mockWorkspace = {
        repositories: [
          { repoId: new Types.ObjectId('507f1f77bcf86cd799439011') },
        ],
      };
      mockWorkspaceModel.findById.mockResolvedValue(mockWorkspace);

      const result = await repository.getRepositories('workspace123');
      expect(result).toEqual(['507f1f77bcf86cd799439011']);
      expect(mockWorkspaceModel.findById).toHaveBeenCalledWith('workspace123');
    });

    it('should throw NotFoundException if workspace is not found', async () => {
      mockWorkspaceModel.findById.mockResolvedValue(null);

      await expect(repository.getRepositories('workspace123')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('addRepository', () => {
    it('should successfully add a repository', async () => {
      mockWorkspaceModel.updateOne.mockResolvedValue({ matchedCount: 1 });

      await repository.addRepository(
        'workspace123',
        '507f1f77bcf86cd799439011',
      );
      expect(mockWorkspaceModel.updateOne).toHaveBeenCalledWith(
        { _id: 'workspace123' },
        {
          $push: {
            repositories: {
              repoId: new Types.ObjectId('507f1f77bcf86cd799439011'),
            },
          },
        },
      );
    });

    it('should throw NotFoundException if workspace is not matched', async () => {
      mockWorkspaceModel.updateOne.mockResolvedValue({ matchedCount: 0 });

      await expect(
        repository.addRepository('workspace123', '507f1f77bcf86cd799439011'),
      ).rejects.toThrow(new NotFoundException('Workspace non trovato'));
    });
  });

  describe('removeRepository', () => {
    it('should successfully remove a repository', async () => {
      mockWorkspaceModel.updateOne.mockResolvedValue({
        matchedCount: 1,
        modifiedCount: 1,
      });

      await repository.removeRepository(
        '507f1f77bcf86cd799439011',
        'workspace123',
      );
      expect(mockWorkspaceModel.updateOne).toHaveBeenCalledWith(
        { _id: 'workspace123' },
        {
          $pull: {
            repositories: {
              repoId: new Types.ObjectId('507f1f77bcf86cd799439011'),
            },
          },
        },
      );
    });

    it('should throw NotFoundException if workspace is not matched', async () => {
      mockWorkspaceModel.updateOne.mockResolvedValue({
        matchedCount: 0,
        modifiedCount: 0,
      });

      await expect(
        repository.removeRepository('507f1f77bcf86cd799439011', 'workspace123'),
      ).rejects.toThrow(new NotFoundException('Workspace non trovato'));
    });

    it('should throw NotFoundException if repository is not found in workspace', async () => {
      mockWorkspaceModel.updateOne.mockResolvedValue({
        matchedCount: 1,
        modifiedCount: 0,
      });

      await expect(
        repository.removeRepository('507f1f77bcf86cd799439011', 'workspace123'),
      ).rejects.toThrow(
        new NotFoundException('Repository non trovata nel workspace'),
      );
    });
  });
});
