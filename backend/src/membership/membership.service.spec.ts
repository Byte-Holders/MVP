import { Test, TestingModule } from '@nestjs/testing';
import { MembershipService } from './membership.service';
import { MembershipRepository } from './membership.repository';

describe('MembershipService', () => {
  let service: MembershipService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MembershipService,
        {
          provide: MembershipRepository,
          useValue: {
            findPendingInvite: jest.fn(),
            addInvite: jest.fn(),
            findPendingInvites: jest.fn(),
            updateInvite: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<MembershipService>(MembershipService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
