import { Test, TestingModule } from '@nestjs/testing';
import { WorkspaceRepositoryService } from './workspaceRepository.service';
import { WorkspaceRepositoryToken } from '../interfaces/workspaceRepository.repository.interface';
import { RepositoryReaderToken } from '../../../repository/interfaces/repository.reader.interface';
import { RepositoryWriterToken } from '../../../repository/interfaces/repository.writer.interface';

describe('WorkspaceRepositoryService', () => {
  let service: WorkspaceRepositoryService;

  // 1. SETUP: Creiamo i Mock (le controfigure) con tutte le funzioni necessarie
  const mockWorkspaceRepository = {
    getRepositories: jest.fn(),
    addRepository: jest.fn(),
    removeRepository: jest.fn(),
    isRepositoryLinkedToAnyWorkspace: jest.fn(), // Usata nel nostro nuovo removeRepository
  };

  const mockRepositoryReader = {
    getRepositories: jest.fn(),
  };

  const mockRepositoryWriter = {
    addRepository: jest.fn(),
    deleteRepository: jest.fn(), // Usata nel nostro nuovo removeRepository
    updateToken: jest.fn(),
  };

  beforeEach(async () => {
    // Puliamo la memoria dei mock prima di ogni singolo test
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkspaceRepositoryService,
        { provide: WorkspaceRepositoryToken, useValue: mockWorkspaceRepository },
        { provide: RepositoryReaderToken, useValue: mockRepositoryReader },
        { provide: RepositoryWriterToken, useValue: mockRepositoryWriter },
      ],
    }).compile();

    service = module.get<WorkspaceRepositoryService>(WorkspaceRepositoryService);
  });

  // --- BLOCCO: getRepositories ---
  describe('getRepositories', () => {
    it('restituisce lista vuota se il workspace non ha repository', async () => {
      // ARRANGE: Il db risponde con un array vuoto
      mockWorkspaceRepository.getRepositories.mockResolvedValue([]);

      // ACT
      const result = await service.getRepositories('workspace-vuoto');

      // ASSERT: Controlliamo che torni [] e che il reader NON venga interpellato inutilmente
      expect(result).toEqual([]);
      expect(mockRepositoryReader.getRepositories).not.toHaveBeenCalled();
    });

    it('restituisce le RepositoryInfo per gli id trovati', async () => {
      // ARRANGE: Prepariamo dati finti
      const idsTrovati = ['repo-1', 'repo-2'];
      const infoFittizie = [{ id: 'repo-1', name: 'Frontend' }];
      mockWorkspaceRepository.getRepositories.mockResolvedValue(idsTrovati);
      mockRepositoryReader.getRepositories.mockResolvedValue(infoFittizie);

      // ACT
      const result = await service.getRepositories('workspace-pieno');

      // ASSERT: Controlliamo che i dati vengano restituiti e il reader riceva gli ID
      expect(result).toEqual(infoFittizie);
      expect(mockRepositoryReader.getRepositories).toHaveBeenCalledWith(idsTrovati, undefined);
    });

    it('passa searchInput a repositoryReader quando fornito', async () => {
      // ARRANGE
      mockWorkspaceRepository.getRepositories.mockResolvedValue(['repo-1']);
      mockRepositoryReader.getRepositories.mockResolvedValue([]);

      // ACT: Invochiamo la funzione passando la parola chiave 'ricerca-test'
      await service.getRepositories('workspace-1', 'ricerca-test');

      // ASSERT: Il dettaglio cruciale. Il reader DEVE ricevere la parola chiave come secondo argomento
      expect(mockRepositoryReader.getRepositories).toHaveBeenCalledWith(['repo-1'], 'ricerca-test');
    });

    it('propaga NotFoundException se il workspace non esiste', async () => {
      // ARRANGE: Simuliamo un errore dal database
      const erroreScatenato = new Error('NotFoundException');
      mockWorkspaceRepository.getRepositories.mockRejectedValue(erroreScatenato);

      // ACT & ASSERT: Il servizio deve rifiutare la promessa con lo stesso errore
      await expect(service.getRepositories('workspace-fantasma')).rejects.toThrow(erroreScatenato);
    });
  });

  // --- BLOCCO: addRepository ---
  describe('addRepository', () => {
    it('aggiunge una repository pubblica senza token', async () => {
      mockRepositoryWriter.addRepository.mockResolvedValue('newRepoId');
      mockWorkspaceRepository.addRepository.mockResolvedValue(undefined);

      await service.addRepository('ws-1', 'http://repo.pubblica');

      expect(mockRepositoryWriter.addRepository).toHaveBeenCalledWith('http://repo.pubblica', undefined);
      expect(mockWorkspaceRepository.addRepository).toHaveBeenCalledWith('ws-1', 'newRepoId');
    });

    it('aggiunge una repository privata con token valido', async () => {
      mockRepositoryWriter.addRepository.mockResolvedValue('newRepoId');
      mockWorkspaceRepository.addRepository.mockResolvedValue(undefined);

      await service.addRepository('ws-1', 'http://repo.privata', 'token-segreto');

      expect(mockRepositoryWriter.addRepository).toHaveBeenCalledWith('http://repo.privata', 'token-segreto');
    });

    it('propaga eccezione se repositoryWriter fallisce (token non valido)', async () => {
      const erroreScatenato = new Error('UnauthorizedException');
      mockRepositoryWriter.addRepository.mockRejectedValue(erroreScatenato);

      await expect(service.addRepository('ws-1', 'url', 'token-falso')).rejects.toThrow(erroreScatenato);
      expect(mockWorkspaceRepository.addRepository).not.toHaveBeenCalled();
    });

    it('propaga NotFoundException se il workspace non esiste durante addRepository', async () => {
      mockRepositoryWriter.addRepository.mockResolvedValue('newRepoId');
      const erroreScatenato = new Error('NotFoundException');
      mockWorkspaceRepository.addRepository.mockRejectedValue(erroreScatenato);

      await expect(service.addRepository('ws-inesistente', 'url')).rejects.toThrow(erroreScatenato);
    });
  });

  // --- BLOCCO: removeRepository ---
  describe('removeRepository', () => {
    it('delega correttamente la rimozione al repository', async () => {
      mockWorkspaceRepository.removeRepository.mockResolvedValue(undefined);
      // Simuliamo che la repo serva ancora altrove, così non viene distrutta
      mockWorkspaceRepository.isRepositoryLinkedToAnyWorkspace.mockResolvedValue(true); 

      await service.removeRepository('repo-1', 'ws-1');

      expect(mockWorkspaceRepository.removeRepository).toHaveBeenCalledWith('repo-1', 'ws-1');
      expect(mockRepositoryWriter.deleteRepository).not.toHaveBeenCalled();
    });

    it('propaga NotFoundException se workspace non trovato', async () => {
      const error = new Error('NotFoundException');
      mockWorkspaceRepository.removeRepository.mockRejectedValue(error);

      await expect(service.removeRepository('repo-1', 'ws-inesistente')).rejects.toThrow(error);
    });

    it('propaga NotFoundException se repo non presente nel workspace', async () => {
      const error = new Error('Repository non trovata');
      mockWorkspaceRepository.removeRepository.mockRejectedValue(error);

      await expect(service.removeRepository('repo-fantasma', 'ws-1')).rejects.toThrow(error);
    });

    it('dovrebbe eliminare i dati della repo se non appartiene ad altri workspace', async () => {
      mockWorkspaceRepository.removeRepository.mockResolvedValue(undefined);
      // Diciamo che la repo NON è usata da nessun altro
      mockWorkspaceRepository.isRepositoryLinkedToAnyWorkspace.mockResolvedValue(false);
      mockRepositoryWriter.deleteRepository.mockResolvedValue(undefined);

      await service.removeRepository('repo-isolata', 'ws-1');

      // Verifica che la repo venga distrutta completamente
      expect(mockRepositoryWriter.deleteRepository).toHaveBeenCalledWith('repo-isolata');
    });
  });

  // --- BLOCCO: updateToken ---
  describe('updateToken', () => {
    it('dovrebbe aggiornare il token della repository', async () => {
      mockRepositoryWriter.updateToken.mockResolvedValue(undefined);

      await service.updateToken('repo-1', 'ws-1', 'nuovo-token');

      expect(mockRepositoryWriter.updateToken).toHaveBeenCalledWith('repo-1', 'nuovo-token');
    });
  });
});