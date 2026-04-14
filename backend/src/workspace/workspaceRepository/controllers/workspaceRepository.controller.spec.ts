import { Test, TestingModule } from '@nestjs/testing';
import { WorkspaceRepositoryController } from './workspaceRepository.controller';
import { WorkspaceRepositoryServiceToken } from '../interfaces/workspaceRepository.service.interface';
import type { RepositoryInfo } from '../../../repository/types/repository-info';
import { AddRepositoryDto } from '../../../repository/dtos/add-repository.dto';
import { AccessTokenDto } from '../dtos/access-token.dto';

const makeRepositoryInfo = (
  overrides: Partial<RepositoryInfo> = {},
): RepositoryInfo => ({
  repositoryId: 'myRepositoryId',
  ownerName: 'myOwner',
  name: 'myRepo',
  branches: ['main'],
  ...overrides,
});

describe('WorkspaceRepositoryController', () => {
  let controller: WorkspaceRepositoryController;
  let mockService: {
    getRepositories: jest.Mock;
    addRepository: jest.Mock;
    removeRepository: jest.Mock;
    updateToken: jest.Mock;
  };

  beforeEach(async () => {
    mockService = {
      getRepositories: jest.fn(),
      addRepository: jest.fn(),
      removeRepository: jest.fn(),
      updateToken: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorkspaceRepositoryController],
      providers: [
        { provide: WorkspaceRepositoryServiceToken, useValue: mockService },
      ],
    }).compile();

    controller = module.get<WorkspaceRepositoryController>(
      WorkspaceRepositoryController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getRepositories', () => {
    it('returns the repositories from the service', async () => {
      const repos = [
        makeRepositoryInfo({ repositoryId: 'id1' }),
        makeRepositoryInfo({ repositoryId: 'id2' }),
      ];
      mockService.getRepositories.mockResolvedValue(repos);

      const result = await controller.getRepositories('myWorkspaceId', {});

      expect(mockService.getRepositories).toHaveBeenCalledWith(
        'myWorkspaceId',
        undefined,
      );
      expect(result).toEqual(repos);
    });

    it('forwards the searchInput query param to the service', async () => {
      mockService.getRepositories.mockResolvedValue([]);

      await controller.getRepositories('myWorkspaceId', {
        searchInput: 'mySearch',
      });

      expect(mockService.getRepositories).toHaveBeenCalledWith(
        'myWorkspaceId',
        'mySearch',
      );
    });

    it('returns an empty array when the service returns no repositories', async () => {
      mockService.getRepositories.mockResolvedValue([]);

      const result = await controller.getRepositories('myWorkspaceId', {});

      expect(result).toEqual([]);
    });

    it('rejects when the service rejects', async () => {
      mockService.getRepositories.mockRejectedValue(
        new Error('workspace not found'),
      );

      await expect(
        controller.getRepositories('myWorkspaceId', {}),
      ).rejects.toThrow('workspace not found');
    });
  });

  describe('addRepository', () => {
    it('delegates to the service with the correct params', async () => {
      mockService.addRepository.mockResolvedValue(undefined);

      const dto: AddRepositoryDto = {
        repositoryUrl: 'https://github.com/owner/repo',
        accessToken: 'ghp_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      };

      await controller.addRepository('myWorkspaceId', dto);

      expect(mockService.addRepository).toHaveBeenCalledWith(
        'myWorkspaceId',
        dto.repositoryUrl,
        dto.accessToken,
      );
    });

    it('works without an access token', async () => {
      mockService.addRepository.mockResolvedValue(undefined);

      const dto: AddRepositoryDto = {
        repositoryUrl: 'https://github.com/owner/repo',
      };

      await controller.addRepository('myWorkspaceId', dto);

      expect(mockService.addRepository).toHaveBeenCalledWith(
        'myWorkspaceId',
        dto.repositoryUrl,
        undefined,
      );
    });

    it('rejects when the service rejects', async () => {
      mockService.addRepository.mockRejectedValue(new Error('service error'));

      await expect(
        controller.addRepository('myWorkspaceId', {
          repositoryUrl: 'https://github.com/owner/repo',
        }),
      ).rejects.toThrow('service error');
    });
  });

  describe('removeRepository', () => {
    it('delegates to the service with the correct params', async () => {
      mockService.removeRepository.mockResolvedValue(undefined);

      await controller.removeRepository('myWorkspaceId', 'myRepositoryId');

      expect(mockService.removeRepository).toHaveBeenCalledWith(
        'myRepositoryId',
        'myWorkspaceId',
      );
    });

    it('rejects when the service rejects', async () => {
      mockService.removeRepository.mockRejectedValue(
        new Error('repository not found'),
      );

      await expect(
        controller.removeRepository('myWorkspaceId', 'myRepositoryId'),
      ).rejects.toThrow('repository not found');
    });
  });

  describe('updateToken', () => {
    it('delegates to the service with the correct params', async () => {
      mockService.updateToken.mockResolvedValue(undefined);

      const dto: AccessTokenDto = {
        accessToken: 'ghp_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      };

      await controller.updateToken('myWorkspaceId', 'myRepositoryId', dto);

      expect(mockService.updateToken).toHaveBeenCalledWith(
        'myRepositoryId',
        'myWorkspaceId',
        dto.accessToken,
      );
    });

    it('rejects when the service rejects', async () => {
      mockService.updateToken.mockRejectedValue(new Error('service error'));

      await expect(
        controller.updateToken('myWorkspaceId', 'myRepositoryId', {
          accessToken: 'ghp_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        }),
      ).rejects.toThrow('service error');
    });
  });
});
