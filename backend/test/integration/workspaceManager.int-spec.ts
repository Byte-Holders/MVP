import { Test, TestingModule } from '@nestjs/testing';
import {
  MongooseModule,
  getModelToken,
  getConnectionToken,
} from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { WorkspaceModule } from '../../src/workspace/workspace.module';
import { Workspace } from '../../src/workspace/schemas/workspace.schema';
import { WorkspaceManagerService } from '../../src/workspace/workspaceManager/workspaceManager.service';
import { WorkspaceManagerModule } from '../../src/workspace/workspaceManager/workspaceManager.module'; // Importalo se esiste un modulo separato

import * as dotenv from 'dotenv';
dotenv.config(); // Carica le variabili d'ambiente dal file .env

describe('WorkspaceManager Integration Tests', () => {
  let dbConnection: Connection;
  let workspaceModel: Model<Workspace>;

  // 2. DICHIARIAMO LA VARIABILE CORRETTA
  let managerService: WorkspaceManagerService;

  beforeAll(async () => {
    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
      throw new Error(
        "La variabile d'ambiente MONGO_URI deve essere impostata per i test di integrazione.",
      );
    }

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(mongoUri),
        WorkspaceModule,
        WorkspaceManagerModule, // Assicuriamoci di caricare la "scatola" del Manager
      ],
    }).compile();

    // 3. ESTRAIAMO IL SERVIZIO GIUSTO
    // (Nota: se il tuo team usa un Token qui come faceva per le repository,
    // potresti dover usare un Token es: moduleFixture.get<WorkspaceManagerService>('IWorkspaceManagerServiceToken'))
    managerService = moduleFixture.get<WorkspaceManagerService>(
      'IWorkspaceManagerService',
    );

    workspaceModel = moduleFixture.get<Model<Workspace>>(
      getModelToken(Workspace.name),
    );
    dbConnection = moduleFixture.get(getConnectionToken());
  });

  // ... da qui in poi lascia il tuo afterEach, afterAll e tutti i describe() intatti! ...

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

  describe('createWorkspace', () => {
    it('dovrebbe creare un workspace nel DB e impostare il creatore come PROJECT_MANAGER', async () => {
      // 1. ARRANGE
      const datiNuovoWorkspace = {
        name: 'Progetto Gamma',
        ownerId: 'user-123',
        ownerUsername: 'giacomo_dev',
      };

      // 2. ACT
      const workspaceCreato =
        await managerService.createWorkspace(datiNuovoWorkspace);

      // 3. ASSERT
      // Andiamo a leggere il database vero per vedere cos'ha salvato Mongoose
      // (Attenzione: assicurati di usare workspaceCreato.id o workspaceCreato._id a seconda di come è fatto il tuo BO)
      const documentoNelDb = await workspaceModel
        .findById(workspaceCreato.id || (workspaceCreato as any)._id)
        .exec();

      expect(documentoNelDb).toBeDefined();
      expect(documentoNelDb!.name).toBe('Progetto Gamma');

      // Verifichiamo la logica di business del tuo service!
      expect(documentoNelDb!.members.length).toBe(1);
      expect(documentoNelDb!.members[0].userId).toBe('user-123');
      expect(documentoNelDb!.members[0].role).toBe('Project Manager');
    });

    it('dovrebbe lanciare una ConflictException se cerco di creare un workspace con un nome già esistente', async () => {
      // 1. ARRANGE
      const dati = {
        name: 'Progetto Duplicato',
        ownerId: 'user-123',
        ownerUsername: 'giacomo_dev',
      };

      // Creiamo il primo con successo
      await managerService.createWorkspace(dati);

      // 2 & 3. ACT & ASSERT
      // Proviamo a ricrearlo identico e ci aspettiamo che il service catturi l'errore 11000 di Mongo
      // e lanci la tua ConflictException
      await expect(managerService.createWorkspace(dati)).rejects.toThrow(
        'Hai già un workspace chiamato "Progetto Duplicato"',
      );
    });
  });

  describe('deleteWorkspace', () => {
    it('dovrebbe cancellare il workspace se chi lo richiede è il proprietario', async () => {
      // 1. ARRANGE
      // Piantiamo un workspace nel DB
      const workspaceDaCancellare = await workspaceModel.create({
        name: 'Da Cancellare',
        ownerId: 'user-proprietario',
        creationDate: new Date(),
        members: [],
      });
      const id = workspaceDaCancellare._id.toString();

      // 2. ACT
      // Chiamiamo la delete passando l'ID giusto del proprietario
      await managerService.deleteWorkspace(id, 'user-proprietario');

      // 3. ASSERT
      // Il workspace non deve più esistere nel DB
      const verificaDb = await workspaceModel.findById(id).exec();
      expect(verificaDb).toBeNull();
    });

    it('dovrebbe lanciare ForbiddenException se un utente non proprietario prova a cancellarlo', async () => {
      // 1. ARRANGE
      const workspaceDaCancellare = await workspaceModel.create({
        name: 'Top Secret',
        ownerId: 'user-proprietario',
        creationDate: new Date(),
        members: [],
      });
      const id = workspaceDaCancellare._id.toString();

      // 2 & 3. ACT & ASSERT
      // Passiamo un ID di un utente "intruso"
      await expect(
        managerService.deleteWorkspace(id, 'utente-intruso'),
      ).rejects.toThrow('Solo il proprietario può cancellare il workspace');
    });
  });
});
