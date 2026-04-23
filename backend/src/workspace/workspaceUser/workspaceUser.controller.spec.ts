import { Test, TestingModule } from '@nestjs/testing';
import { WorkspaceUserController } from './workspaceUser.controller';
import { IWorkspaceUserServiceToken } from './interfaces/IWorkspaceUserService';
import { GetUsersOfWorkspaceResponseDto } from './dto/getUserOfWorkspace.responseDto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { WorkspaceRole } from '../roles.enum';

describe('WorkspaceUserController', () => {
  let controller: WorkspaceUserController;

  // Mock del Service
  const mockWorkspaceUserService = {
    getUsersOfWorkspace: jest.fn(),
    removeUserFromWorkspace: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorkspaceUserController],
      providers: [
        {
          provide: IWorkspaceUserServiceToken,
          useValue: mockWorkspaceUserService,
        },
      ],
    })
      // Sovrascriviamo la guardia per il test isolato.
      // Diciamo a NestJS: "Fingi che la guardia dia sempre l'ok (true)".
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<WorkspaceUserController>(WorkspaceUserController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getUsersOfWorkspace', () => {
    it('dovrebbe restituire la lista degli utenti tramite il service', async () => {
      const workspaceId = 'workspace-123';
      const mockUsers: GetUsersOfWorkspaceResponseDto[] = [
        {
          userId: 'user-1',
          username: 'testuser',
          role: WorkspaceRole.DEVELOPER,
        },
      ];

      mockWorkspaceUserService.getUsersOfWorkspace.mockResolvedValueOnce(
        mockUsers,
      );

      const result = await controller.getUsersOfWorkspace(workspaceId);

      expect(mockWorkspaceUserService.getUsersOfWorkspace).toHaveBeenCalledWith(
        workspaceId,
      );
      expect(result).toEqual(mockUsers);
    });
  });

  describe('removeUserFromWorkspace', () => {
    it("dovrebbe chiamare il service per rimuovere l'utente", async () => {
      const workspaceId = 'workspace-123';
      const userId = 'user-1';
      const user = {
        userId: 'user-remover',
        username: 'remover',
        sub: 'sub123',
      };

      mockWorkspaceUserService.removeUserFromWorkspace.mockResolvedValueOnce(
        undefined,
      );

      await controller.removeUserFromWorkspace(workspaceId, userId, user);

      expect(
        mockWorkspaceUserService.removeUserFromWorkspace,
      ).toHaveBeenCalledWith(workspaceId, userId, user.userId);
    });
  });
});
