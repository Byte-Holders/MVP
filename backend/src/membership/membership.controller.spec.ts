import { Test, TestingModule } from '@nestjs/testing';
import { MembershipController } from './membership.controller';
import { MembershipService } from './membership.service';
import { IMembershipServiceToken } from './interfaces/IMembershipService.interface';
import { InviteUserDto, ManageInviteDto, ManageInviteAction, MembershipStatus } from './dto/membership.dto';
import type { RequestUser } from '../auth/types/requestUser.type';

describe('MembershipController', () => {
  let controller: MembershipController;

  // 1. Creiamo il mock del Service
  const mockMembershipService = {
    inviteUser: jest.fn(),
    getInvites: jest.fn(),
    manageInvite: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MembershipController],
      providers: [
        {
          provide: IMembershipServiceToken, // Usiamo lo stesso Token del controller
          useValue: mockMembershipService,
        },
      ],
    }).compile();

    controller = module.get<MembershipController>(MembershipController);
  });

  it('dovrebbe essere definito', () => {
    expect(controller).toBeDefined();
  });

  describe('inviteUser', () => {
    it('dovrebbe mappare correttamente il DTO e l\'utente, e chiamare il service', async () => {
      // Arrange: Prepariamo i finti dati in ingresso
      const mockDto: InviteUserDto = {
        workspaceId: 'workspace123',
        recipientUsername: 'luigi.verdi',
        recipientRole: 'Admin' as any, // Forza il tipo in base al tuo Enum
      };

      const mockUser: RequestUser = {
        sub: 'sub123',
        userId: 'user-sender-1',
        username: 'mario.rossi',
      };

      // Act: Chiamiamo il controller DIRETTAMENTE, passandogli i parametri
      await controller.inviteUser(mockDto, mockUser);

      // Assert: Verifichiamo la trasformazione da DTO a "InviteUserInfo"
      expect(mockMembershipService.inviteUser).toHaveBeenCalledWith({
        workspaceId: 'workspace123',
        senderId: 'user-sender-1',           // Preso dal @User()
        recipientUsername: 'luigi.verdi',    // Preso dal DTO
        recipientRole: 'Admin',              // Preso dal DTO
      });
    });
  });

  describe('getInvites', () => {
    it('dovrebbe restituire la lista degli inviti per l\'utente corrente', async () => {
      // Arrange
      const mockUser: RequestUser = {
        sub: 'sub123',
        userId: 'user123',
        username: 'mario',
      };
      
      const mockServiceResponse = [{ _id: 'inv1', workspaceName: "Workspace 1", senderUsername: 'mario.rossi', recipientUsername: 'luigi.verdi', recipientRole: 'Admin', status: MembershipStatus.Pending }];
      mockMembershipService.getInvites.mockResolvedValue(mockServiceResponse);

      // Act
      const result = await controller.getInvites(mockUser);

      // Assert
      expect(result).toEqual(mockServiceResponse);
      expect(mockMembershipService.getInvites).toHaveBeenCalledWith('user123');
    });
  });

  describe('manageInvite', () => {
    it('dovrebbe mappare correttamente il DTO e chiamare il service', async () => {
      // Arrange
      const mockDto: ManageInviteDto = {
        membershipId: 'invite123',
        action: ManageInviteAction.Accept,
      };

      // Act
      await controller.manageInvite(mockDto);

      // Assert: Verifichiamo la trasformazione in "ManageInviteInfo"
      expect(mockMembershipService.manageInvite).toHaveBeenCalledWith({
        id: 'invite123',
        action: ManageInviteAction.Accept,
      });
    });
  });
});