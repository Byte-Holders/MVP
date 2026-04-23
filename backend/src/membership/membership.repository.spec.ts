import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException } from '@nestjs/common';
import { MembershipRepository } from './membership.repository';
import { Membership } from './schema/membership.schema';
import { MembershipStatus } from './dto/membership.dto';

// 1. Creiamo un oggetto per simulare la catena di Mongoose (.populate().lean().exec())
const mockQueryChain = {
  populate: jest.fn().mockReturnThis(),
  lean: jest.fn().mockReturnThis(),
  exec: jest.fn(),
};

// 2. Creiamo il mock del modello Mongoose
class MockMembershipModel {
  // Simula il costruttore chiamato in addInvite
  save: jest.Mock;

  constructor(private data: any) {
    this.save = jest.fn().mockResolvedValue(this.data);
  }

  // Simuliamo i metodi statici usati dal Repository
  static updateOne = jest.fn();
  static find = jest.fn();
  static findOne = jest.fn();
}

describe('MembershipRepository', () => {
  let repository: MembershipRepository;

  beforeEach(async () => {
    // Resettiamo i mock prima di ogni test per evitare sovrapposizioni
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MembershipRepository,
        {
          provide: getModelToken(Membership.name), // Il token esatto che usi in @InjectModel
          useValue: MockMembershipModel, // Passiamo la nostra classe Mock
        },
      ],
    }).compile();

    repository = module.get<MembershipRepository>(MembershipRepository);
  });

  it('dovrebbe essere definito', () => {
    expect(repository).toBeDefined();
  });

  describe('addInvite', () => {
    it('dovrebbe creare e salvare un nuovo invito', async () => {
      const mockParams: any = { workspaceId: 'w1', recipientId: 'r1' };

      // Essendo un metodo void, ci basta verificare che non lanci errori
      await expect(repository.addInvite(mockParams)).resolves.not.toThrow();
    });
  });

  describe('updateInvite', () => {
    it('dovrebbe aggiornare lo status se trova una corrispondenza', async () => {
      // Configuriamo il mock per simulare un aggiornamento riuscito
      MockMembershipModel.updateOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ matchedCount: 1 }),
      });

      await expect(
        repository.updateInvite('id123', MembershipStatus.Accepted),
      ).resolves.not.toThrow();

      // Verifichiamo che updateOne sia stato chiamato con i parametri corretti
      expect(MockMembershipModel.updateOne).toHaveBeenCalledWith(
        { _id: 'id123' },
        { $set: { status: MembershipStatus.Accepted } },
      );
    });

    it('dovrebbe lanciare NotFoundException se non ci sono corrispondenze (matchedCount === 0)', async () => {
      // Configuriamo il mock per simulare nessun record trovato
      MockMembershipModel.updateOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ matchedCount: 0 }),
      });

      await expect(
        repository.updateInvite('id123', MembershipStatus.Accepted),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findPendingInvites', () => {
    it('dovrebbe restituire una lista di inviti mappati correttamente', async () => {
      // Dati grezzi simulati dal database
      const mockDbResult = [
        {
          _id: 'mongo_id_1',
          workspaceId: { name: 'Il Mio Spazio' },
          senderId: { username: 'mario.rossi' },
          recipientId: { username: 'luigi.verdi' },
          recipientRole: 'Admin',
          status: MembershipStatus.Pending,
        },
      ];

      // Configuriamo la catena di mongoose in modo che exec() restituisca i nostri dati
      mockQueryChain.exec.mockResolvedValue(mockDbResult);
      MockMembershipModel.find.mockReturnValue(mockQueryChain);

      const result = await repository.findPendingInvites('user123');

      // Verifichiamo che la mappatura (trasformazione) avvenga in modo corretto
      expect(result).toEqual([
        {
          _id: 'mongo_id_1',
          workspaceName: 'Il Mio Spazio',
          senderUsername: 'mario.rossi',
          recipientUsername: 'luigi.verdi',
          recipientRole: 'Admin',
          status: MembershipStatus.Pending,
        },
      ]);

      // Verifichiamo che find sia stato chiamato coi filtri giusti
      expect(MockMembershipModel.find).toHaveBeenCalledWith({
        recipientId: 'user123',
        status: MembershipStatus.Pending,
      });
    });
  });

  describe('findPendingInviteById', () => {
    it("dovrebbe restituire null se l'invito non esiste", async () => {
      // Mongoose restituisce null se findOne non trova nulla
      mockQueryChain.exec.mockResolvedValue(null);
      MockMembershipModel.findOne.mockReturnValue(mockQueryChain);

      const result = await repository.findPendingInviteById('id123');

      expect(result).toBeNull();
    });

    it("dovrebbe restituire un MembershipEntity mappato se l'invito esiste", async () => {
      const mockDbResult = {
        _id: 'mongo_id_2',
        workspaceId: 'workspace123',
        senderId: 'sender123',
        recipientId: 'recipient123',
        recipientRole: 'Member',
        status: MembershipStatus.Pending,
      };

      mockQueryChain.exec.mockResolvedValue(mockDbResult);
      MockMembershipModel.findOne.mockReturnValue(mockQueryChain);

      const result = await repository.findPendingInviteById('id123');

      // Verifica che la funzione .toString() e la mappatura generale abbiano funzionato
      expect(result).toEqual({
        _id: 'mongo_id_2',
        workspaceId: 'workspace123',
        senderId: 'sender123',
        recipientId: 'recipient123',
        recipientRole: 'Member',
        status: MembershipStatus.Pending,
      });
    });
  });
});
