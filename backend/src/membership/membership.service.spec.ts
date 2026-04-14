import { Test, TestingModule } from '@nestjs/testing';
import { MembershipService } from './membership.service';
import { BadRequestException, NotFoundException, PreconditionFailedException } from '@nestjs/common';
import { ManageInviteAction, MembershipStatus } from './dto/membership.dto';

// Importa i Token esatti che usi nel Service
import { IMembershipRepositoryToken } from './interfaces/IMembershipRepository.interface';
import { FindUserByUsernameToken } from '../user/interfaces/IfindUserByUsername.interface';
import { IAddUserToWorkspaceToken } from '../workspace/workspaceUser/interfaces/IAddUserToWorkspace.interface';
import { WorkspaceRole } from '../workspace/roles.enum';

describe('MembershipService', () => {
  let service: MembershipService;

  // 1. Definiamo i Mock per le tre dipendenze esterne
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

  beforeEach(async () => {
    // Resettiamo i mock prima di ogni test
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MembershipService,
        // Iniettiamo i mock usando i Custom Token
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
      ],
    }).compile();

    service = module.get<MembershipService>(MembershipService);
  });

  it('dovrebbe essere definito', () => {
    expect(service).toBeDefined();
  });

  // --- TEST PER: inviteUser ---
  describe('inviteUser', () => {
    const mockInviteInfo = {
      recipientUsername: 'mario.rossi',
      workspaceId: 'w1',
      senderId: 's1',
      recipientRole: WorkspaceRole.DEVELOPER,
    };

    it('dovrebbe lanciare NotFoundException se l\'utente non esiste', async () => {
      mockFindUserByUsername.findByUsername.mockResolvedValue(null);

      await expect(service.inviteUser(mockInviteInfo)).rejects.toThrow(NotFoundException);
    });

    it('dovrebbe lanciare BadRequestException se esiste già un invito pendente', async () => {
      mockFindUserByUsername.findByUsername.mockResolvedValue({ _id: 'u1' });
      // Simuliamo che il db trovi un invito già esistente
      mockRepository.findPendingInvite.mockResolvedValue({ _id: 'invite1' });

      await expect(service.inviteUser(mockInviteInfo)).rejects.toThrow(BadRequestException);
    });

    it('dovrebbe creare un nuovo invito con successo', async () => {
      mockFindUserByUsername.findByUsername.mockResolvedValue({ _id: 'u1' });
      mockRepository.findPendingInvite.mockResolvedValue(null); // Nessun invito pendente trovato

      await service.inviteUser(mockInviteInfo);

      // Verifichiamo che addInvite sia stato chiamato con i parametri corretti (incluso lo stato Pending)
      expect(mockRepository.addInvite).toHaveBeenCalledWith({
        workspaceId: 'w1',
        senderId: 's1',
        recipientId: 'u1',
        recipientRole: WorkspaceRole.DEVELOPER,
        status: MembershipStatus.Pending,
      });
    });
  });

  // --- TEST PER: getInvites ---
  describe('getInvites', () => {
    it('dovrebbe restituire la lista degli inviti pendenti', async () => {
      const mockPopulatedInvites = [{ _id: 'inv1', status: MembershipStatus.Pending }];
      mockRepository.findPendingInvites.mockResolvedValue(mockPopulatedInvites);

      const result = await service.getInvites('u1');

      expect(result).toEqual(mockPopulatedInvites);
      expect(mockRepository.findPendingInvites).toHaveBeenCalledWith('u1');
    });
  });

  // --- TEST PER: manageInvite ---
  describe('manageInvite', () => {
    const mockManageActionAccept = { id: 'inv1', action: ManageInviteAction.Accept };
    const mockManageActionReject = { id: 'inv1', action: ManageInviteAction.Reject };

    it('dovrebbe lanciare BadRequestException se l\'invito non esiste', async () => {
      mockRepository.findPendingInviteById.mockResolvedValue(null);

      await expect(service.manageInvite(mockManageActionAccept)).rejects.toThrow(BadRequestException);
    });

    it('dovrebbe lanciare Error se non riesce a recuperare l\'username del destinatario', async () => {
      mockRepository.findPendingInviteById.mockResolvedValue({ recipientId: 'u1' });
      // Simuliamo che la lista non contenga il nostro invito o manchi l'username
      mockRepository.findPendingInvites.mockResolvedValue([{ _id: 'inv2' }]);

      await expect(service.manageInvite(mockManageActionAccept)).rejects.toThrow("errore nel recupero dell'username");
    });

    describe('Azione: Accept', () => {
      beforeEach(() => {
        // Setup di base valido per tutti i test "Accept"
        mockRepository.findPendingInviteById.mockResolvedValue({ recipientId: 'u1', workspaceId: 'w1', recipientRole: WorkspaceRole.DEVELOPER });
        mockRepository.findPendingInvites.mockResolvedValue([{ _id: 'inv1', recipientUsername: 'mario.rossi' }]);
      });

      it('dovrebbe lanciare NotFoundException se l\'utente da aggiungere non viene trovato', async () => {
        mockFindUserByUsername.findByUsername.mockResolvedValue(null);

        await expect(service.manageInvite(mockManageActionAccept)).rejects.toThrow(NotFoundException);
      });

      it('dovrebbe rifiutare l\'invito e lanciare PreconditionFailedException se l\'utente è già nel workspace', async () => {
        mockFindUserByUsername.findByUsername.mockResolvedValue({ _id: 'u1', username: 'mario.rossi' });
        
        // Simuliamo l'errore del workspace service
        mockAddUserToWorkspace.addUserToWorkspace.mockRejectedValue(new PreconditionFailedException());

        await expect(service.manageInvite(mockManageActionAccept)).rejects.toThrow(PreconditionFailedException);
        
        // Verifica cruciale: ci assicuriamo che in caso di errore, lo status sia stato messo su Rejected
        expect(mockRepository.updateInvite).toHaveBeenCalledWith('inv1', MembershipStatus.Rejected);
      });

      it('dovrebbe aggiungere l\'utente al workspace e aggiornare l\'invito ad Accepted', async () => {
        mockFindUserByUsername.findByUsername.mockResolvedValue({ _id: 'u1', sub: "sub123", username: 'mario.rossi', email: "email@example.com" });
        mockAddUserToWorkspace.addUserToWorkspace.mockResolvedValue(true); // Successo

        await service.manageInvite(mockManageActionAccept);

        // Verifichiamo che il service per aggiungere l'utente sia stato chiamato
        expect(mockAddUserToWorkspace.addUserToWorkspace).toHaveBeenCalledWith(
          { userId: 'u1', username: 'mario.rossi', role: WorkspaceRole.DEVELOPER  },
          'w1'
        );
        // Verifichiamo che l'invito sia stato salvato come accettato
        expect(mockRepository.updateInvite).toHaveBeenCalledWith('inv1', MembershipStatus.Accepted);
      });
    });

    describe('Azione: Reject', () => {
      it('dovrebbe aggiornare l\'invito a Rejected in caso di azione Reject', async () => {
        // Setup di base
        mockRepository.findPendingInviteById.mockResolvedValue({ recipientId: 'u1' });
        mockRepository.findPendingInvites.mockResolvedValue([{ _id: 'inv1', recipientUsername: 'mario.rossi' }]);

        await service.manageInvite(mockManageActionReject);

        // Verifichiamo che salti tutta la logica di 'Accept' e vada diretto al Reject
        expect(mockAddUserToWorkspace.addUserToWorkspace).not.toHaveBeenCalled();
        expect(mockRepository.updateInvite).toHaveBeenCalledWith('inv1', MembershipStatus.Rejected);
      });
    });
  });
});