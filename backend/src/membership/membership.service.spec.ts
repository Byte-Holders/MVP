import { Test, TestingModule } from '@nestjs/testing';
import { MembershipService } from './membership.service';
import {
  BadRequestException,
  NotFoundException,
  PreconditionFailedException,
} from '@nestjs/common';
import { ManageInviteAction, MembershipStatus } from './dto/membership.dto';

import { IMembershipRepositoryToken } from './interfaces/IMembershipRepository.interface';
import { FindUserByUsernameToken } from '../user/interfaces/IfindUserByUsername.interface';
import { IAddUserToWorkspaceToken } from '../workspace/workspaceUser/interfaces/IAddUserToWorkspace.interface';
import { ICheckIfUserInWorkspaceToken } from 'src/workspace/workspaceUser/interfaces/ICheckIfUserInWorkspace';
import { WorkspaceRole } from '../workspace/roles.enum';

describe('MembershipService', () => {
  let service: MembershipService;

  const mockRepository = {
    addInvite: jest.fn(),
    findPendingInvite: jest.fn(),
    findPendingInvites: jest.fn(),
    findPendingInviteById: jest.fn(),
    updateInvite: jest.fn(),
  };

  const mockFindUserByUsername = {
    findByUsername: jest.fn(),
  };

  const mockAddUserToWorkspace = {
    addUserToWorkspace: jest.fn(),
  };

  const mockCheckIfUserInWorkspace = {
    checkIfUserIsInWorkspace: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MembershipService,
        {
          provide: IMembershipRepositoryToken,
          useValue: mockRepository,
        },
        {
          provide: FindUserByUsernameToken,
          useValue: mockFindUserByUsername,
        },
        {
          provide: IAddUserToWorkspaceToken,
          useValue: mockAddUserToWorkspace,
        },
        {
          provide: ICheckIfUserInWorkspaceToken,
          useValue: mockCheckIfUserInWorkspace,
        },
      ],
    }).compile();

    service = module.get<MembershipService>(MembershipService);
  });

  it('dovrebbe essere definito', () => {
    expect(service).toBeDefined();
  });

  describe('inviteUser', () => {
    const mockInviteInfo = {
      recipientUsername: 'mario.rossi',
      workspaceId: 'w1',
      senderId: 's1',
      recipientRole: WorkspaceRole.DEVELOPER,
    };

    it("dovrebbe lanciare NotFoundException se l'utente non esiste", async () => {
      mockFindUserByUsername.findByUsername.mockResolvedValue(null);

      await expect(service.inviteUser(mockInviteInfo)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('dovrebbe lanciare BadRequestException se esiste già un invito pendente', async () => {
      mockFindUserByUsername.findByUsername.mockResolvedValue({
        _id: 'u1',
        sub: 'sub123',
        username: 'mario.rossi',
        email: 'mario.rossi@example.com',
      });
      mockCheckIfUserInWorkspace.checkIfUserIsInWorkspace.mockResolvedValue(
        false,
      );
      mockRepository.findPendingInvite.mockResolvedValue({ _id: 'invite1' });

      await expect(service.inviteUser(mockInviteInfo)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('dovrebbe creare un nuovo invito con successo', async () => {
      mockFindUserByUsername.findByUsername.mockResolvedValue({
        _id: 'u1',
        sub: 'sub123',
        username: 'mario.rossi',
        email: 'mario.rossi@example.com',
      });
      mockCheckIfUserInWorkspace.checkIfUserIsInWorkspace.mockResolvedValue(
        false,
      );
      mockRepository.findPendingInvite.mockResolvedValue(null);

      await service.inviteUser(mockInviteInfo);

      expect(mockRepository.addInvite).toHaveBeenCalledWith({
        workspaceId: 'w1',
        senderId: 's1',
        recipientId: 'u1',
        recipientRole: WorkspaceRole.DEVELOPER,
        status: MembershipStatus.Pending,
      });
    });
  });

  describe('getInvites', () => {
    it('dovrebbe restituire la lista degli inviti pendenti', async () => {
      const mockPopulatedInvites = [
        { _id: 'inv1', status: MembershipStatus.Pending },
      ];
      mockRepository.findPendingInvites.mockResolvedValue(mockPopulatedInvites);

      const result = await service.getInvites('u1');

      expect(result).toEqual(mockPopulatedInvites);
      expect(mockRepository.findPendingInvites).toHaveBeenCalledWith('u1');
    });
  });

  describe('manageInvite', () => {
    const mockManageActionAccept = {
      id: 'inv1',
      action: ManageInviteAction.Accept,
    };
    const mockManageActionReject = {
      id: 'inv1',
      action: ManageInviteAction.Reject,
    };

    it("dovrebbe lanciare BadRequestException se l'invito non esiste", async () => {
      mockRepository.findPendingInviteById.mockResolvedValue(null);

      await expect(
        service.manageInvite(mockManageActionAccept),
      ).rejects.toThrow(BadRequestException);
    });

    it("dovrebbe lanciare Error se non riesce a recuperare l'username del destinatario", async () => {
      mockRepository.findPendingInviteById.mockResolvedValue({
        recipientId: 'u1',
      });
      mockRepository.findPendingInvites.mockResolvedValue([{ _id: 'inv2' }]);

      await expect(
        service.manageInvite(mockManageActionAccept),
      ).rejects.toThrow("errore nel recupero dell'username");
    });

    describe('Azione: Accept', () => {
      beforeEach(() => {
        mockRepository.findPendingInviteById.mockResolvedValue({
          recipientId: 'u1',
          workspaceId: 'w1',
          recipientRole: WorkspaceRole.DEVELOPER,
        });
        mockRepository.findPendingInvites.mockResolvedValue([
          { _id: 'inv1', recipientUsername: 'mario.rossi' },
        ]);
      });

      it("dovrebbe lanciare NotFoundException se l'utente da aggiungere non viene trovato", async () => {
        mockFindUserByUsername.findByUsername.mockResolvedValue(null);

        await expect(
          service.manageInvite(mockManageActionAccept),
        ).rejects.toThrow(NotFoundException);
      });

      it("dovrebbe rifiutare l'invito e lanciare PreconditionFailedException se l'utente è già nel workspace", async () => {
        mockFindUserByUsername.findByUsername.mockResolvedValue({
          _id: 'u1',
          username: 'mario.rossi',
        });

        mockAddUserToWorkspace.addUserToWorkspace.mockRejectedValue(
          new PreconditionFailedException(),
        );

        await expect(
          service.manageInvite(mockManageActionAccept),
        ).rejects.toThrow(PreconditionFailedException);

        expect(mockRepository.updateInvite).toHaveBeenCalledWith(
          'inv1',
          MembershipStatus.Rejected,
        );
      });

      it("dovrebbe aggiungere l'utente al workspace e aggiornare l'invito ad Accepted", async () => {
        mockFindUserByUsername.findByUsername.mockResolvedValue({
          _id: 'u1',
          sub: 'sub123',
          username: 'mario.rossi',
          email: 'email@example.com',
        });
        mockAddUserToWorkspace.addUserToWorkspace.mockResolvedValue(true);

        await service.manageInvite(mockManageActionAccept);

        expect(mockAddUserToWorkspace.addUserToWorkspace).toHaveBeenCalledWith(
          {
            userId: 'u1',
            username: 'mario.rossi',
            role: WorkspaceRole.DEVELOPER,
          },
          'w1',
        );
        expect(mockRepository.updateInvite).toHaveBeenCalledWith(
          'inv1',
          MembershipStatus.Accepted,
        );
      });
    });

    describe('Azione: Reject', () => {
      it("dovrebbe aggiornare l'invito a Rejected in caso di azione Reject", async () => {
        mockRepository.findPendingInviteById.mockResolvedValue({
          recipientId: 'u1',
        });
        mockRepository.findPendingInvites.mockResolvedValue([
          { _id: 'inv1', recipientUsername: 'mario.rossi' },
        ]);

        await service.manageInvite(mockManageActionReject);

        expect(
          mockAddUserToWorkspace.addUserToWorkspace,
        ).not.toHaveBeenCalled();
        expect(mockRepository.updateInvite).toHaveBeenCalledWith(
          'inv1',
          MembershipStatus.Rejected,
        );
      });
    });
  });
});
