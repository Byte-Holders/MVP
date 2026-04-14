import { Test, TestingModule } from '@nestjs/testing';
import { MembershipService } from './membership.service';
import { IMembershipRepositoryToken } from './interfaces/IMembershipRepository.interface';
import { FindUserByUsernameToken } from '../user/interfaces/IfindUserByUsername.interface';
import { IAddUserToWorkspaceToken } from '../workspace/workspaceUser/interfaces/IAddUserToWorkspace.interface';

describe('MembershipService', () => {
  let service: MembershipService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MembershipService,
        {
          provide: IMembershipRepositoryToken,
          useValue: {
            findPendingInvite: jest.fn(),
            addInvite: jest.fn(),
            findPendingInvites: jest.fn(),
            updateInvite: jest.fn(),
            findPendingInviteById: jest.fn(),
          },
        },
        {
          provide: FindUserByUsernameToken,
          useValue: { findByUsername: jest.fn() },
        },
        {
          provide: IAddUserToWorkspaceToken,
          useValue: { addUserToWorkspace: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<MembershipService>(MembershipService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
