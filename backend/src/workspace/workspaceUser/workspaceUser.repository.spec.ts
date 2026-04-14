import { Test, TestingModule } from '@nestjs/testing';
import { WorkspaceUserRepository } from './workspaceUser.repository';
import { getModelToken } from '@nestjs/mongoose';
import { Workspace } from '../schemas/workspace.schema';
import { NotFoundException } from '@nestjs/common';
import { WorkspaceRole } from '../roles.enum';
import { Model } from 'mongoose';
import { UserOfWorkspaceEntity } from './entity/userOfWorkspace.entity';

describe('WorkspaceUserRepository', () => {
  let repository: WorkspaceUserRepository;
  let model: Model<Workspace>;

  // Oggetti mock per concatenare i metodi di Mongoose come findById().lean().exec()
  const mockExec = jest.fn();
  const mockLean = jest.fn().mockReturnValue({ exec: mockExec });
  const mockQueryBuilder = {
    lean: mockLean,
    exec: mockExec,
  };

  const mockWorkspaceModel = {
    findById: jest.fn().mockReturnValue(mockQueryBuilder),
    findOne: jest.fn().mockReturnValue(mockQueryBuilder),
    updateOne: jest.fn().mockReturnValue({ exec: mockExec }), // updateOne di solito usa solo .exec() qui
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkspaceUserRepository,
        {
          provide: getModelToken(Workspace.name),
          useValue: mockWorkspaceModel,
        },
      ],
    }).compile();

    repository = module.get<WorkspaceUserRepository>(WorkspaceUserRepository);
    model = module.get<Model<Workspace>>(getModelToken(Workspace.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getUsersOfWorkspace', () => {
    it('dovrebbe restituire un array di UserOfWorkspaceEntity', async () => {
      const workspaceId = 'workspace-123';
      const mockWorkspace = {
        _id: workspaceId,
        members: [
          { userId: 'user-1', userUsername: 'testuser', role: 'ADMIN' },
        ],
      };

      mockExec.mockResolvedValueOnce(mockWorkspace);

      const result = await repository.getUsersOfWorkspace(workspaceId);

      expect(model.findById).toHaveBeenCalledWith(workspaceId);
      expect(result).toEqual([
        { userId: 'user-1', username: 'testuser', role: 'ADMIN' },
      ]);
    });

    it('dovrebbe lanciare NotFoundException se il workspace non esiste', async () => {
      const workspaceId = 'invalid-id';
      mockExec.mockResolvedValueOnce(null);

      await expect(repository.getUsersOfWorkspace(workspaceId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('removeUserFromWorkspace', () => {
    it('dovrebbe rimuovere un utente dal workspace', async () => {
      const workspaceId = 'workspace-123';
      const userId = 'user-1';

      mockExec.mockResolvedValueOnce({}); // Risultato fittizio di updateOne

      await repository.removeUserFromWorkspace(workspaceId, userId);

      expect(model.updateOne).toHaveBeenCalledWith(
        { _id: workspaceId },
        { $pull: { members: { userId } } },
      );
      expect(mockExec).toHaveBeenCalled();
    });
  });

  describe('addUserToWorkspace', () => {
    it('dovrebbe aggiungere un utente al workspace', async () => {
      const workspaceId = 'workspace-123';
      const mockUser: UserOfWorkspaceEntity = {
        userId: 'user-2',
        username: 'newuser',
        role: WorkspaceRole.DEVELOPER, // Assicurati di usare l'enum corretto dal tuo progetto
      };

      mockExec.mockResolvedValueOnce({});

      await repository.addUserToWorkspace(mockUser, workspaceId);

      expect(model.updateOne).toHaveBeenCalledWith(
        { _id: workspaceId },
        {
          $push: {
            members: {
              userId: mockUser.userId,
              userUsername: mockUser.username,
              role: mockUser.role,
            },
          },
        },
      );
    });
  });

  describe('getUserRoleForRepository', () => {
    it("dovrebbe restituire il ruolo dell'utente se presente", async () => {
      const repositoryId = 'repo-123';
      const userId = 'user-1';
      const mockWorkspace = {
        members: [{ userId: 'user-1', role: 'ADMIN' }],
      };

      mockExec.mockResolvedValueOnce(mockWorkspace);

      const result = await repository.getUserRoleForRepository(
        repositoryId,
        userId,
      );

      expect(model.findOne).toHaveBeenCalledWith({
        'repositories.repoId': repositoryId,
        'members.userId': userId,
      });
      expect(result).toBe('ADMIN');
    });

    it('dovrebbe restituire null se il workspace non viene trovato', async () => {
      mockExec.mockResolvedValueOnce(null);

      const result = await repository.getUserRoleForRepository(
        'repo-123',
        'user-1',
      );

      expect(result).toBeNull();
    });

    it('dovrebbe restituire null se l\'utente non è tra i membri (edge case)', async () => {
      const mockWorkspace = {
        members: [{ userId: 'another-user', role: 'ADMIN' }],
      };
      mockExec.mockResolvedValueOnce(mockWorkspace);

      const result = await repository.getUserRoleForRepository(
        'repo-123',
        'user-1',
      );

      expect(result).toBeNull();
    });
  });

  describe('checkIfUserIsInWorkspace', () => {
    it('dovrebbe restituire true se l\'utente fa parte del workspace', async () => {
      const workspaceId = 'workspace-123';
      const userId = 'user-1';
      const mockWorkspace = {
        members: [{ userId: 'user-1' }],
      };

      mockExec.mockResolvedValueOnce(mockWorkspace);

      const result = await repository.checkIfUserIsInWorkspace(
        workspaceId,
        userId,
      );

      expect(result).toBe(true);
    });

    it('dovrebbe restituire false se l\'utente NON fa parte del workspace', async () => {
      const workspaceId = 'workspace-123';
      const userId = 'user-1';
      const mockWorkspace = {
        members: [{ userId: 'another-user' }],
      };

      mockExec.mockResolvedValueOnce(mockWorkspace);

      const result = await repository.checkIfUserIsInWorkspace(
        workspaceId,
        userId,
      );

      expect(result).toBe(false);
    });

    it('dovrebbe lanciare NotFoundException se il workspace non esiste', async () => {
      const workspaceId = 'invalid-id';
      mockExec.mockResolvedValueOnce(null);

      await expect(
        repository.checkIfUserIsInWorkspace(workspaceId, 'user-1'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});