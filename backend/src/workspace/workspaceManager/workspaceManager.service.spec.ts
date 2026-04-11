import { Test, TestingModule } from '@nestjs/testing';
import { WorkspaceManagerService } from './workspaceManager.service';
import { ConflictException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { WorkspaceRole } from '../roles.enum'; // Controlla che il path sia giusto!

describe('WorkspaceManagerService', () => {
  let service: WorkspaceManagerService;
  let mockRepository: any;

  beforeEach(async () => {
    // Il nostro Database fittizio
    mockRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      delete: jest.fn(),
      findByMemberId: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkspaceManagerService,
        {
          provide: 'IWorkspaceManagerRepository',
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<WorkspaceManagerService>(WorkspaceManagerService);
  });

  afterEach(() => {
    // Puliamo le chiamate fittizie dopo ogni test per non "sporcare" quelli successivi
    jest.clearAllMocks();
  });

  it('dovrebbe essere definito', () => {
    expect(service).toBeDefined();
  });

  // ==========================================
  // TEST: createWorkspace
  // ==========================================
  describe('createWorkspace', () => {
    
    it('dovrebbe lanciare ConflictException se il nome esiste già (errore 11000)', async () => {
      const datiCreazione = { name: 'Workspace Doppio', ownerId: 'user1', ownerUsername: 'user1' };
      mockRepository.create.mockRejectedValue({ code: 11000 });

      await expect(service.createWorkspace(datiCreazione)).rejects.toThrow(ConflictException);
    });

    it('dovrebbe creare il workspace con successo', async () => {
      const datiCreazione = { name: 'Nuovo WS', ownerId: 'user1', ownerUsername: 'user1' };
      
      // Simuliamo il documento restituito dal DB (con l'id finto e i dati)
      const fintoDocumentoSalvato = {
        _id: 'id-fittizio-123',
        ...datiCreazione,
        creationDate: new Date(),
        // Usiamo "members" e mettiamo i campi che il mapper si aspetta!
        members: [{ userId: 'user1', userUsername: 'user1', role: WorkspaceRole.PROJECT_MANAGER }],
        repositories: []
      };
      
      mockRepository.create.mockResolvedValue(fintoDocumentoSalvato);

      const risultato = await service.createWorkspace(datiCreazione);

      // Verifichiamo che il database sia stato chiamato 1 volta
      expect(mockRepository.create).toHaveBeenCalledTimes(1);
      // Verifichiamo che il mapper abbia restituito un oggetto (non vuoto)
      expect(risultato).toBeDefined();
    });
  });

  // ==========================================
  // TEST: deleteWorkspace
  // ==========================================
  describe('deleteWorkspace', () => {

    it('dovrebbe lanciare NotFoundException se il workspace non esiste', async () => {
      // Simuliamo che il DB non trovi nulla
      mockRepository.findById.mockResolvedValue(null);

      await expect(service.deleteWorkspace('ws-inesistente', 'user1')).rejects.toThrow(NotFoundException);
      // Verifichiamo che la funzione delete non venga MAI chiamata se esplode prima
      expect(mockRepository.delete).not.toHaveBeenCalled();
    });

    it('dovrebbe lanciare ForbiddenException se a cancellare NON è il proprietario', async () => {
      // Simuliamo un workspace il cui owner è 'VeroProprietario'
      const fintoWorkspace = { _id: 'ws-1', ownerId: 'VeroProprietario' };
      mockRepository.findById.mockResolvedValue(fintoWorkspace);

      // Proviamo a cancellarlo con l'id 'Impostore'
      await expect(service.deleteWorkspace('ws-1', 'Impostore')).rejects.toThrow(ForbiddenException);
      expect(mockRepository.delete).not.toHaveBeenCalled();
    });

    it('dovrebbe eliminare il workspace se a cancellare è il proprietario', async () => {
      const fintoWorkspace = { _id: 'ws-1', ownerId: 'VeroProprietario' };
      mockRepository.findById.mockResolvedValue(fintoWorkspace);

      // Questa volta l'id di chi richiede la cancellazione coincide
      await service.deleteWorkspace('ws-1', 'VeroProprietario');

      // Se non è esploso, verifichiamo che abbia chiamato il delete del repository
      expect(mockRepository.delete).toHaveBeenCalledWith('ws-1');
      expect(mockRepository.delete).toHaveBeenCalledTimes(1);
    });
  });

  // ==========================================
  // TEST: getWorkspaces
  // ==========================================
  describe('getWorkspaces', () => {
    
    it('dovrebbe restituire la lista dei workspace', async () => {
      // Simuliamo che il DB trovi 2 workspace a cui l'utente partecipa
      const fintiWorkspaces = [
        { 
          _id: 'ws-1', 
          name: 'WS Alfa', 
          ownerId: 'user1', 
          members: [{ userId: 'user1', userUsername: 'user1', role: WorkspaceRole.PROJECT_MANAGER }] 
        },
        { 
          _id: 'ws-2', 
          name: 'WS Beta', 
          ownerId: 'user1', 
          members: [{ userId: 'user1', userUsername: 'user1', role: WorkspaceRole.PROJECT_MANAGER }] 
        }
      ];
      mockRepository.findByMemberId.mockResolvedValue(fintiWorkspaces);

      const risultato = await service.getWorkspaces('user1');

      expect(mockRepository.findByMemberId).toHaveBeenCalledWith('user1');
      expect(risultato).toBeDefined();
      expect(Array.isArray(risultato)).toBe(true);
      expect(risultato.length).toBe(2);
    });
  });

});