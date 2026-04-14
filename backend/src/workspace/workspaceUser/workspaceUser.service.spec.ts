import { Test, TestingModule } from '@nestjs/testing';
import { WorkspaceUserService } from './workspaceUser.service';
import { IWorkspaceUserRepositoryToken } from './interfaces/IWorkspaceUserRepository.interface';
import { NotFoundException, PreconditionFailedException } from '@nestjs/common';
import { UserOfWorkspaceInfo } from './type/userOfWorkspace.type';
import { WorkspaceRole } from '../roles.enum';

describe('WorkspaceUserService', () => {
  let service: WorkspaceUserService;
  
  // Creiamo un oggetto mock che simulerà il comportamento del repository
  const mockWorkspaceUserRepository = {
    getUsersOfWorkspace: jest.fn(),
    checkIfUserIsInWorkspace: jest.fn(),
    removeUserFromWorkspace: jest.fn(),
    getUserRoleForRepository: jest.fn(),
    addUserToWorkspace: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkspaceUserService,
        {
          // Usiamo lo stesso Injection Token usato nel costruttore del Service
          provide: IWorkspaceUserRepositoryToken,
          useValue: mockWorkspaceUserRepository,
        },
      ],
    }).compile();

    service = module.get<WorkspaceUserService>(WorkspaceUserService);
  });

  afterEach(() => {
    // Ripuliamo i mock dopo ogni test per evitare che i risultati si sovrappongano
    jest.clearAllMocks();
  });

  describe('getUsersOfWorkspace', () => {
    it('dovrebbe restituire la lista degli utenti del workspace', async () => {
      const workspaceId = 'workspace-123';
      const mockUsers = [
        { userId: 'user-1', username: 'testuser', role: WorkspaceRole.DEVELOPER },
      ];

      mockWorkspaceUserRepository.getUsersOfWorkspace.mockResolvedValueOnce(mockUsers);

      const result = await service.getUsersOfWorkspace(workspaceId);

      expect(mockWorkspaceUserRepository.getUsersOfWorkspace).toHaveBeenCalledWith(workspaceId);
      expect(result).toEqual(mockUsers);
    });
  });

  describe('removeUserFromWorkspace', () => {
    it('dovrebbe rimuovere un utente se è presente nel workspace', async () => {
      const workspaceId = 'workspace-123';
      const userId = 'user-1';

      // Simuliamo che l'utente esista nel workspace
      mockWorkspaceUserRepository.checkIfUserIsInWorkspace.mockResolvedValueOnce(true);

      await service.removeUserFromWorkspace(workspaceId, userId);

      expect(mockWorkspaceUserRepository.checkIfUserIsInWorkspace).toHaveBeenCalledWith(workspaceId, userId);
      expect(mockWorkspaceUserRepository.removeUserFromWorkspace).toHaveBeenCalledWith(workspaceId, userId);
    });

    it('dovrebbe lanciare NotFoundException se l\'utente NON è presente nel workspace', async () => {
      const workspaceId = 'workspace-123';
      const userId = 'user-invalid';

      // Simuliamo che l'utente NON esista nel workspace
      mockWorkspaceUserRepository.checkIfUserIsInWorkspace.mockResolvedValueOnce(false);

      await expect(service.removeUserFromWorkspace(workspaceId, userId)).rejects.toThrow(
        NotFoundException,
      );

      // Verifichiamo che il metodo di rimozione non sia mai stato chiamato
      expect(mockWorkspaceUserRepository.removeUserFromWorkspace).not.toHaveBeenCalled();
    });
  });

  describe('getUserRoleForRepository', () => {
    it('dovrebbe restituire il ruolo dell\'utente per il repository specifico', async () => {
      const repositoryId = 'repo-123';
      const userId = 'user-1';
      const mockRole = WorkspaceRole.DEVELOPER;

      mockWorkspaceUserRepository.getUserRoleForRepository.mockResolvedValueOnce(mockRole);

      const result = await service.getUserRoleForRepository(repositoryId, userId);

      expect(mockWorkspaceUserRepository.getUserRoleForRepository).toHaveBeenCalledWith(repositoryId, userId);
      expect(result).toBe(mockRole);
    });
  });

  describe('addUserToWorkspace', () => {
    it('dovrebbe aggiungere un utente al workspace se non ne fa già parte', async () => {
      const workspaceId = 'workspace-123';
      const mockUser: UserOfWorkspaceInfo = {
        userId: 'user-2',
        username: 'newuser',
        role: WorkspaceRole.DEVELOPER, // Castato se usi un enum specifico
      };

      // L'utente non è nel workspace, quindi l'inserimento è valido
      mockWorkspaceUserRepository.checkIfUserIsInWorkspace.mockResolvedValueOnce(false);

      await service.addUserToWorkspace(mockUser, workspaceId);

      expect(mockWorkspaceUserRepository.checkIfUserIsInWorkspace).toHaveBeenCalledWith(workspaceId, mockUser.userId);
      expect(mockWorkspaceUserRepository.addUserToWorkspace).toHaveBeenCalledWith(mockUser, workspaceId);
    });

    it('dovrebbe lanciare PreconditionFailedException se l\'utente è già nel workspace', async () => {
      const workspaceId = 'workspace-123';
      const mockUser: UserOfWorkspaceInfo = {
        userId: 'user-2',
        username: 'newuser',
        role: WorkspaceRole.DEVELOPER,
      };

      // L'utente è già nel workspace
      mockWorkspaceUserRepository.checkIfUserIsInWorkspace.mockResolvedValueOnce(true);

      await expect(service.addUserToWorkspace(mockUser, workspaceId)).rejects.toThrow(
        PreconditionFailedException,
      );

      // Verifichiamo che il metodo per aggiungere l'utente non sia mai stato chiamato
      expect(mockWorkspaceUserRepository.addUserToWorkspace).not.toHaveBeenCalled();
    });
  });
});