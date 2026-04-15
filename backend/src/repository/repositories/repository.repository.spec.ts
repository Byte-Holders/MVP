import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { RepositoryRepository } from './repository.repository';
import { Repository } from '../schemas/repository.schema';

const makeDoc = (overrides: Partial<Repository & { _id: Types.ObjectId }> = {}) => {
  const id = overrides._id ?? new Types.ObjectId();
  return {
    _id: id,
    ownerName: 'owner',
    name: 'repo',
    dateScan: undefined,
    documentationScore: undefined,
    codeCoverage: undefined,
    cvss: undefined,
    accessToken: undefined,
    ...overrides,
  };
};

describe('RepositoryRepository', () => {
  let repo: RepositoryRepository;
  let mockModel: {
    find: jest.Mock;
    findById: jest.Mock;
    findOne: jest.Mock;
    create: jest.Mock;
    updateOne: jest.Mock;
  };

  beforeEach(async () => {
    mockModel = {
      find: jest.fn(),
      findById: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      updateOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RepositoryRepository,
        { provide: getModelToken(Repository.name), useValue: mockModel },
      ],
    }).compile();

    repo = module.get<RepositoryRepository>(RepositoryRepository);
  });

  describe('getRepositories', () => {
    it('returns mapped entities for the given ids', async () => {
      const id1 = new Types.ObjectId();
      const id2 = new Types.ObjectId();
      const docs = [
        makeDoc({ _id: id1, ownerName: 'alice', name: 'alpha' }),
        makeDoc({ _id: id2, ownerName: 'bob', name: 'beta' }),
      ];
      mockModel.find.mockResolvedValue(docs);

      const result = await repo.getRepositories([id1.toString(), id2.toString()]);

      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({ repositoryId: id1.toString(), ownerName: 'alice', name: 'alpha' });
      expect(result[1]).toMatchObject({ repositoryId: id2.toString(), ownerName: 'bob', name: 'beta' });
    });

    it('passes searchInput as a case-insensitive regex filter', async () => {
      mockModel.find.mockResolvedValue([]);

      await repo.getRepositories([], 'my-repo');

      expect(mockModel.find).toHaveBeenCalledWith(
        expect.objectContaining({
          name: { $regex: 'my-repo', $options: 'i' },
        }),
      );
    });

    it('escapes regex special chars in searchInput', async () => {
      mockModel.find.mockResolvedValue([]);

      await repo.getRepositories([], 'a.b*c');

      const [filter] = mockModel.find.mock.calls[0] as [Record<string, unknown>];
      expect((filter['name'] as { $regex: string }).$regex).toBe('a\\.b\\*c');
    });

    it('omits name filter when searchInput is not provided', async () => {
      mockModel.find.mockResolvedValue([]);

      await repo.getRepositories([]);

      const [filter] = mockModel.find.mock.calls[0] as [Record<string, unknown>];
      expect(filter['name']).toBeUndefined();
    });
  });

  describe('getRepository', () => {
    it('returns the entity when found', async () => {
      const id = new Types.ObjectId();
      mockModel.findById.mockResolvedValue(makeDoc({ _id: id }));

      const result = await repo.getRepository(id.toString());

      expect(result.repositoryId).toBe(id.toString());
    });

    it('throws NotFoundException when not found', async () => {
      mockModel.findById.mockResolvedValue(null);

      await expect(repo.getRepository('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('addRepository', () => {
    it('creates a new repository when it does not exist and returns its id', async () => {
      const id = new Types.ObjectId();
      mockModel.findOne.mockResolvedValue(null);
      mockModel.create.mockResolvedValue({ _id: id });

      const result = await repo.addRepository('owner', 'repo', 'token');

      expect(mockModel.create).toHaveBeenCalledWith({
        ownerName: 'owner',
        name: 'repo',
        accessToken: 'token',
      });
      expect(result).toBe(id.toString());
    });

    it('returns existing id without creating when repository already exists and no token', async () => {
      const id = new Types.ObjectId();
      mockModel.findOne.mockResolvedValue(makeDoc({ _id: id }));

      const result = await repo.addRepository('owner', 'repo');

      expect(mockModel.create).not.toHaveBeenCalled();
      expect(mockModel.updateOne).not.toHaveBeenCalled();
      expect(result).toBe(id.toString());
    });

    it('updates accessToken when repository already exists and token is provided', async () => {
      const id = new Types.ObjectId();
      mockModel.findOne.mockResolvedValue(makeDoc({ _id: id }));
      mockModel.updateOne.mockResolvedValue({ matchedCount: 1 });

      await repo.addRepository('owner', 'repo', 'newToken');

      expect(mockModel.updateOne).toHaveBeenCalledWith(
        { _id: id },
        { $set: { accessToken: 'newToken' } },
      );
    });
  });

  describe('updateToken', () => {
    it('calls updateOne with the new token', async () => {
      mockModel.updateOne.mockResolvedValue({ matchedCount: 1 });

      await repo.updateToken('myId', 'newToken');

      expect(mockModel.updateOne).toHaveBeenCalledWith(
        { _id: 'myId' },
        { $set: { accessToken: 'newToken' } },
      );
    });

    it('throws NotFoundException when repository is not found', async () => {
      mockModel.updateOne.mockResolvedValue({ matchedCount: 0 });

      await expect(repo.updateToken('missingId', 'token')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateScores', () => {
    it('calls updateOne with the provided scores', async () => {
      mockModel.updateOne.mockResolvedValue({ matchedCount: 1 });
      const scores = { documentationScore: 8, cvss: 3, codeCoverage: 75 };

      await repo.updateScores('myId', scores);

      expect(mockModel.updateOne).toHaveBeenCalledWith(
        { _id: 'myId' },
        { $set: scores },
      );
    });

    it('throws NotFoundException when repository is not found', async () => {
      mockModel.updateOne.mockResolvedValue({ matchedCount: 0 });

      await expect(
        repo.updateScores('missingId', { documentationScore: 5 }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
