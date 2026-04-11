describe('WorkspaceRepositoryService', () => {
  // --- getRepositories ---

  describe('getRepositories', () => {
    it('restituisce lista vuota se il workspace non ha repository', async () => {
      // workspaceRepositoryRepository.getRepositories → []
      // repositoryReader.getRepositories NON deve essere chiamato
      // risultato atteso: []
    });

    it('restituisce le RepositoryInfo per gli id trovati', async () => {
      // workspaceRepositoryRepository.getRepositories → ['id1', 'id2']
      // repositoryReader.getRepositories(['id1','id2'], undefined) → [info1, info2]
      // verifica che il risultato contenga entrambe le info
    });

    it('passa searchInput a repositoryReader quando fornito', async () => {
      // workspaceRepositoryRepository.getRepositories → ['id1']
      // verifica che repositoryReader.getRepositories sia chiamato con ('keyword')
    });

    it('propaga NotFoundException se il workspace non esiste', async () => {
      // workspaceRepositoryRepository.getRepositories → lancia NotFoundException
      // atteso: il service rilancia la stessa eccezione
    });
  });

  // --- addRepository ---

  describe('addRepository', () => {
    it('aggiunge una repository pubblica senza token', async () => {
      // repositoryWriter.addRepository(url, undefined) → 'newRepoId'
      // workspaceRepositoryRepository.addRepository(workspaceId, 'newRepoId') chiamato
      // nessuna eccezione
    });

    it('aggiunge una repository privata con token valido', async () => {
      // repositoryWriter.addRepository(url, 'ghp_xxx') → 'newRepoId'
      // verifica che il token venga passato correttamente
    });

    it('propaga eccezione se repositoryWriter fallisce (token non valido)', async () => {
      // repositoryWriter.addRepository → lancia UnauthorizedException
      // workspaceRepositoryRepository.addRepository NON deve essere chiamato
      // atteso: eccezione propagata
    });

    it('propaga NotFoundException se il workspace non esiste durante addRepository', async () => {
      // repositoryWriter.addRepository → 'newRepoId'
      // workspaceRepositoryRepository.addRepository → lancia NotFoundException
    });
  });

  // --- removeRepository ---

  describe('removeRepository', () => {
    it('delega correttamente la rimozione al repository', async () => {
      // workspaceRepositoryRepository.removeRepository(repoId, workspaceId) chiamato
    });

    it('propaga NotFoundException se workspace non trovato', async () => {
      // workspaceRepositoryRepository.removeRepository → NotFoundException
    });

    it('propaga NotFoundException se repo non presente nel workspace', async () => {
      // workspaceRepositoryRepository.removeRepository → NotFoundException('Repository non trovata')
    });

    // ⚠️ TEST CHE DOCUMENTA IL GAP — da implementare
    it('TODO: dovrebbe eliminare i dati della repo se non appartiene ad altri workspace', async () => {
      // comportamento atteso ma non ancora implementato
      // questo test FALLIRÀ finché non si implementa la logica
      expect(true).toBe(false); // placeholder esplicito
    });
  });

  // --- updateToken ---

  describe('updateToken', () => {
    // ⚠️ TEST CHE DOCUMENTA IL TODO
    it('TODO: dovrebbe aggiornare il token della repository', async () => {
      // al momento il metodo è vuoto e non fa nulla
      // il test documenta che la funzionalità è attesa
      expect(true).toBe(false); // fallisce intenzionalmente
    });
  });
});
