import { Test, TestingModule } from '@nestjs/testing';
import { MembershipController } from './membership.controller';
import { IMembershipServiceToken } from './interfaces/IMembershipService.interface';

describe('MembershipController', () => {
  let controller: MembershipController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MembershipController],
      providers: [
        {
          provide: IMembershipServiceToken,
          useValue: {
            inviteUser: jest.fn(),
            getInvites: jest.fn(),
            manageInvite: jest.fn(),
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
