import { Test, TestingModule } from '@nestjs/testing';
import { WorkspaceManagerController } from './workspaceManager.controller';
import { CreateWorkspaceDto } from './dtos/CreateWorkspaceDto';
import { WorkspaceMapper } from './WorkspaceMapper';

describe('WorkspaceManagerController', () => {
  let controller: WorkspaceManagerController;

  const mockService = {
    createWorkspace: jest.fn(),
    deleteWorkspace: jest.fn(),
    getWorkspaces: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorkspaceManagerController],
      providers: [
        {
          provide: 'IWorkspaceManagerService',
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<WorkspaceManagerController>(
      WorkspaceManagerController,
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should create a workspace', async () => {
    const dto: CreateWorkspaceDto = { name: 'Test Workspace' };
    const user: any = { userId: '1', username: 'testuser' };

    mockService.createWorkspace.mockResolvedValue({
      id: '123',
      name: 'Test Workspace',
    });

    // Correzione: uso di jest.spyOn() per mockare moduli/classi
    jest.spyOn(WorkspaceMapper, 'toCreateBO').mockReturnValue({} as any);
    jest
      .spyOn(WorkspaceMapper, 'toCreateResponseDto')
      .mockReturnValue({ workspaceId: '123' } as any);

    const result = await controller.create(dto, user);
    expect(mockService.createWorkspace).toHaveBeenCalled();
    expect(result).toEqual({ workspaceId: '123' });
  });

  it('should delete a workspace', async () => {
    const user: any = { userId: '1', username: 'testuser' };
    await controller.delete('123', user);
    expect(mockService.deleteWorkspace).toHaveBeenCalledWith('123', '1');
  });

  it('should list workspaces', async () => {
    const user: any = { userId: '1', username: 'testuser' };
    mockService.getWorkspaces.mockResolvedValue([{}]);
    jest.spyOn(WorkspaceMapper, 'toListItemDto').mockReturnValue({} as any);

    const result = await controller.list(user);
    expect(mockService.getWorkspaces).toHaveBeenCalledWith('1');
    expect(result.length).toBe(1);
  });
});
