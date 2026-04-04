import { Test, TestingModule } from '@nestjs/testing';
import { MembershipController } from './membership.controller';
import { MembershipRepository } from './membership.repository';

describe('MembershipController', () => {
  let controller: MembershipController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MembershipController,
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

    controller = module.get<MembershipController>(MembershipController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
