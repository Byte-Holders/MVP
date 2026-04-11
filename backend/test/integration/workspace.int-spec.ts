import { WorkspaceRepositoryModule } from '../../src/workspace/workspaceRepository/workspaceRepository.module';
import { WorkspaceRepositoryServiceToken } from '../../src/workspace/workspaceRepository/interfaces/workspaceRepository.service.interface';
import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule, getModelToken, getConnectionToken } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { WorkspaceModule } from '../../src/workspace/workspace.module';
import { Workspace } from '../../src/workspace/schemas/workspace.schema';
import { WorkspaceRepositoryService } from '../../src/workspace/workspaceRepository/services/workspaceRepository.service';

describe('Workspace Integration Tests', () => {
  let dbConnection: Connection;
  let workspaceModel: Model<Workspace>;
  let service: WorkspaceRepositoryService;

  // 1. BEFORE ALL
  beforeAll(async () => {
    const mongoUri = 'mongodb://admin:mypassword123@56.228.38.104:27017/CodeGuardianTest?authSource=admin';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(mongoUri),
        WorkspaceModule,
        WorkspaceRepositoryModule,
      ],
    }).compile();

    service = moduleFixture.get<WorkspaceRepositoryService>(WorkspaceRepositoryServiceToken);    
    workspaceModel = moduleFixture.get<Model<Workspace>>(getModelToken(Workspace.name));
    dbConnection = moduleFixture.get(getConnectionToken());
  });

  // 2. AFTER EACH
  afterEach(async () => {
    if (!dbConnection || dbConnection.readyState !== 1) {
      return;
    }

    const collections = dbConnection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  });

  // 3. AFTER ALL: Viene eseguito UNA SOLA VOLTA alla fine di tutto
  afterAll(async () => {
    if (dbConnection) {
      await dbConnection.close();
    }
  });
  
  describe('Gestione Repository nel Workspace', () => {
    it('dovrebbe aggiungere una repository a un workspace esistente nel database', async () => {
      // 1. ARRANGE (Prepariamo il terreno)
      // Siccome per aggiungere una repository ci serve un workspace esistente, 
      // lo creiamo noi "manualmente" nel database usando direttamente il modello di Mongoose.
      const workspaceIniziale = await workspaceModel.create({ 
        name: 'Workspace di Prova per Integration Test',
        // Inserisci qui eventuali altri campi obbligatori del tuo schema Workspace, es:
        ownerId: 'user-test',
        creationDate: new Date(),
        repositories: [] // Partiamo con un array vuoto
      });
      
      const repoUrl = 'https://github.com/test/repo-test';
      
      // 2. ACT (Eseguiamo l'azione vera e propria sul servizio)
      // Chiamiamo la funzione che vogliamo testare, passandogli l'ID del workspace appena creato
      await service.addRepository(workspaceIniziale._id.toString(), repoUrl);

      // 3. ASSERT (Verifichiamo il risultato nel database)
      // Andiamo a ripescare il workspace dal database per vedere se la funzione ha fatto il suo lavoro
      const workspaceAggiornato = await workspaceModel.findById(workspaceIniziale._id).exec();
      
      // Verifichiamo che il workspace esista ancora
      expect(workspaceAggiornato).toBeDefined();
      
      // Ora leggiamo le repository usando l'altro metodo del servizio per vedere se la trova
      const repositories = await service.getRepositories(workspaceIniziale._id.toString());
      
      // Ci aspettiamo che ci sia almeno una repository collegata
      expect(repositories.length).toBeGreaterThan(0);
    });
  });

  it('dovrebbe rimuovere una repository da un workspace esistente', async () => {
    // 1. ARRANGE
    // Creiamo un workspace vuoto, esattamente come nel test precedente che ha funzionato
    const workspaceIniziale = await workspaceModel.create({ 
      name: 'Workspace per Test Rimozione',
      ownerId: 'user-test',
      creationDate: new Date(),
      repositories: [] 
    });
    const workspaceId = workspaceIniziale._id.toString();
    
    // Usiamo il servizio stesso per "sporcare" il workspace aggiungendo una repository
    // In questo modo ci pensa lui a formattare l'oggetto esattamente come vuole Mongoose!
    await service.addRepository(workspaceId, 'https://github.com/test/repo-da-rimuovere');

    // Ora usiamo il metodo di lettura per farci restituire le repo e scoprire che ID ha generato
    const repoAggiunte = await service.getRepositories(workspaceId);
    
    // Assicuriamoci che ce ne sia almeno una, poi prendiamo il suo ID
    expect(repoAggiunte.length).toBeGreaterThan(0);
    const idRepositoryDaRimuovere = repoAggiunte[0]!.repositoryId; 

    // 2. ACT
    // Ora che abbiamo l'ID reale formattato dal sistema, eseguiamo la rimozione
    await service.removeRepository(idRepositoryDaRimuovere, workspaceId);

    // 3. ASSERT
    // Andiamo a rileggere le repository del workspace per vedere se si è svuotato
    const repoRimaste = await service.getRepositories(workspaceId);
    
    // L'array deve essere tornato a zero!
    expect(repoRimaste.length).toBe(0);
  });
});