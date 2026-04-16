import { Test, TestingModule } from '@nestjs/testing';
import { RemediationModule } from './remediation.module';
import {
  REMEDIATION_NODE_SERVICE_TOKEN,
  RemediationNodeService,
} from './remediation-node.service';
import { RemediationNodeHelper } from './remediation-node.helper';

jest.mock('@langchain/aws', () => ({
  ChatBedrockConverse: jest
    .fn()
    .mockImplementation(() => ({ invoke: jest.fn() })),
}));

jest.mock('fs/promises', () => ({
  access: jest.fn(),
  readFile: jest.fn(),
}));

describe('RemediationModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [RemediationModule],
    }).compile();
  });

  it('should compile the module', () => {
    expect(module).toBeDefined();
  });

  it('should provide RemediationNodeService under the correct token', () => {
    const service = module.get<RemediationNodeService>(
      REMEDIATION_NODE_SERVICE_TOKEN,
    );
    expect(service).toBeInstanceOf(RemediationNodeService);
  });

  it('should provide RemediationNodeHelper', () => {
    const helper = module.get<RemediationNodeHelper>(RemediationNodeHelper);
    expect(helper).toBeInstanceOf(RemediationNodeHelper);
  });

  it('should export REMEDIATION_NODE_SERVICE_TOKEN', () => {
    const service = module.get<RemediationNodeService>(
      REMEDIATION_NODE_SERVICE_TOKEN,
    );
    expect(service).toBeDefined();
  });
});
