import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { WorkspaceManagerRepository } from './workspaceManager.repository';
import { Workspace } from '../schemas/workspace.schema';

describe('WorkspaceManagerRepository', () => {
  let repository: WorkspaceManagerRepository;

  class MockWorkspaceModel {
    constructor(private data: any) {
      Object.assign(this, data);
    }
    save = jest.fn().mockResolvedValue(this);
    static findByIdAndDelete = jest.fn();
    static findById = jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue({}) });
    static find = jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue([]) });
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkspaceManagerRepository,
        {
          provide: getModelToken(Workspace.name),
          useValue: MockWorkspaceModel,
        },
      ],
    }).compile();

    repository = module.get<WorkspaceManagerRepository>(WorkspaceManagerRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a workspace', async () => {
    const data: any = { name: 'Test', ownerId: '1', initialMembers: [], creationDate: new Date() };
    const result = await repository.create(data);
    expect(result.save).toBeDefined();
  });

  it('should find by id', async () => {
    await repository.findById('123');
    expect(MockWorkspaceModel.findById).toHaveBeenCalledWith('123');
  });

  it('should find by member id', async () => {
    const result = await repository.findByMemberId('user1');
    expect(MockWorkspaceModel.find).toHaveBeenCalledWith({ 'members.userId': 'user1' });
    expect(result).toEqual([]);
  });

  it('should delete a workspace', async () => {
    await repository.delete('123');
    expect(MockWorkspaceModel.findByIdAndDelete).toHaveBeenCalledWith('123');
  });
});