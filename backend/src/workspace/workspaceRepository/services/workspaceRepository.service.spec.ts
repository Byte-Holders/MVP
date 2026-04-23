import { Test, TestingModule } from '@nestjs/testing';
import { WorkspaceRepositoryService } from './workspaceRepository.service';
import { WorkspaceRepositoryToken } from '../interfaces/workspaceRepository.repository.interface';
import { RepositoryReaderToken } from '../../../repository/interfaces/repository.reader.interface';
import { RepositoryWriterToken } from '../../../repository/interfaces/repository.writer.interface';
import type { RepositoryInfo } from '../../../repository/types/repository-info';

const makeRepositoryInfo = (
  overrides: Partial<RepositoryInfo> = {},
): RepositoryInfo => ({
  repositoryId: 'myRepositoryId',
  ownerName: 'myOwner',
  name: 'myRepo',
  ...overrides,
});

describe('WorkspaceRepositoryService', () => {
  let service: WorkspaceRepositoryService;
  let mockWorkspaceRepositoryRepository: {
    getRepositories: jest.Mock;
    addRepository: jest.Mock;
    removeRepository: jest.Mock;
  };
  let mockRepositoryReader: { getRepositories: jest.Mock };
  let mockRepositoryWriter: {
    addRepository: jest.Mock;
    updateToken: jest.Mock;
  };

  beforeEach(async () => {
    mockWorkspaceRepositoryRepository = {
      getRepositories: jest.fn(),
      addRepository: jest.fn(),
      removeRepository: jest.fn(),
    };
    mockRepositoryReader = { getRepositories: jest.fn() };
    mockRepositoryWriter = { addRepository: jest.fn(), updateToken: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkspaceRepositoryService,
        {
          provide: WorkspaceRepositoryToken,
          useValue: mockWorkspaceRepositoryRepository,
        },
        { provide: RepositoryReaderToken, useValue: mockRepositoryReader },
        { provide: RepositoryWriterToken, useValue: mockRepositoryWriter },
      ],
    }).compile();

    service = module.get<WorkspaceRepositoryService>(
      WorkspaceRepositoryService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getRepositories', () => {
    it('returns an empty array when the workspace has no repositories', async () => {
      mockWorkspaceRepositoryRepository.getRepositories.mockResolvedValue([]);

      const result = await service.getRepositories('myWorkspaceId');

      expect(result).toEqual([]);
      expect(mockRepositoryReader.getRepositories).not.toHaveBeenCalled();
    });

    it('returns the repositories returned by the reader', async () => {
      const ids = ['id1', 'id2'];
      const repos = [
        makeRepositoryInfo({ repositoryId: 'id1' }),
        makeRepositoryInfo({ repositoryId: 'id2' }),
      ];
      mockWorkspaceRepositoryRepository.getRepositories.mockResolvedValue(ids);
      mockRepositoryReader.getRepositories.mockResolvedValue(repos);

      const result = await service.getRepositories('myWorkspaceId');

      expect(mockRepositoryReader.getRepositories).toHaveBeenCalledWith(
        ids,
        undefined,
      );
      expect(result).toEqual(repos);
    });

    it('forwards the searchInput to the reader', async () => {
      const ids = ['id1'];
      mockWorkspaceRepositoryRepository.getRepositories.mockResolvedValue(ids);
      mockRepositoryReader.getRepositories.mockResolvedValue([]);

      await service.getRepositories('myWorkspaceId', 'mySearch');

      expect(mockRepositoryReader.getRepositories).toHaveBeenCalledWith(
        ids,
        'mySearch',
      );
    });

    it('rejects when the workspace repository rejects', async () => {
      mockWorkspaceRepositoryRepository.getRepositories.mockRejectedValue(
        new Error('workspace not found'),
      );

      await expect(service.getRepositories('myWorkspaceId')).rejects.toThrow(
        'workspace not found',
      );
    });
  });

  describe('addRepository', () => {
    it('calls the writer then the workspace repository with the returned id', async () => {
      mockRepositoryWriter.addRepository.mockResolvedValue('newRepoId');
      mockWorkspaceRepositoryRepository.addRepository.mockResolvedValue(
        undefined,
      );

      await service.addRepository(
        'myWorkspaceId',
        'https://github.com/owner/repo',
        'myToken',
      );

      expect(mockRepositoryWriter.addRepository).toHaveBeenCalledWith(
        'https://github.com/owner/repo',
        'myToken',
      );
      expect(
        mockWorkspaceRepositoryRepository.addRepository,
      ).toHaveBeenCalledWith('myWorkspaceId', 'newRepoId');
    });

    it('works without an access token', async () => {
      mockRepositoryWriter.addRepository.mockResolvedValue('newRepoId');
      mockWorkspaceRepositoryRepository.addRepository.mockResolvedValue(
        undefined,
      );

      await service.addRepository(
        'myWorkspaceId',
        'https://github.com/owner/repo',
      );

      expect(mockRepositoryWriter.addRepository).toHaveBeenCalledWith(
        'https://github.com/owner/repo',
        undefined,
      );
    });

    it('rejects when the writer rejects', async () => {
      mockRepositoryWriter.addRepository.mockRejectedValue(
        new Error('writer error'),
      );

      await expect(
        service.addRepository('myWorkspaceId', 'https://github.com/owner/repo'),
      ).rejects.toThrow('writer error');

      expect(
        mockWorkspaceRepositoryRepository.addRepository,
      ).not.toHaveBeenCalled();
    });
  });

  describe('removeRepository', () => {
    it('delegates to the workspace repository', async () => {
      mockWorkspaceRepositoryRepository.removeRepository.mockResolvedValue(
        undefined,
      );

      await service.removeRepository('myRepositoryId', 'myWorkspaceId');

      expect(
        mockWorkspaceRepositoryRepository.removeRepository,
      ).toHaveBeenCalledWith('myRepositoryId', 'myWorkspaceId');
    });

    it('rejects when the workspace repository rejects', async () => {
      mockWorkspaceRepositoryRepository.removeRepository.mockRejectedValue(
        new Error('repository not found'),
      );

      await expect(
        service.removeRepository('myRepositoryId', 'myWorkspaceId'),
      ).rejects.toThrow('repository not found');
    });
  });

  describe('updateToken', () => {
    it('delegates to the repository writer after verifying ownership', async () => {
      mockWorkspaceRepositoryRepository.getRepositories.mockResolvedValue([
        'myRepositoryId',
      ]);
      mockRepositoryWriter.updateToken.mockResolvedValue(undefined);

      await expect(
        service.updateToken('myRepositoryId', 'myWorkspaceId', 'myToken'),
      ).resolves.toBeUndefined();

      expect(
        mockWorkspaceRepositoryRepository.getRepositories,
      ).toHaveBeenCalledWith('myWorkspaceId');
      expect(mockRepositoryWriter.updateToken).toHaveBeenCalledWith(
        'myRepositoryId',
        'myToken',
      );
    });

    it('throws NotFoundException when repository is not in the workspace', async () => {
      mockWorkspaceRepositoryRepository.getRepositories.mockResolvedValue([
        'otherId',
      ]);

      await expect(
        service.updateToken('myRepositoryId', 'myWorkspaceId', 'myToken'),
      ).rejects.toThrow('Repository non trovata nel workspace');

      expect(mockRepositoryWriter.updateToken).not.toHaveBeenCalled();
    });
  });
});
