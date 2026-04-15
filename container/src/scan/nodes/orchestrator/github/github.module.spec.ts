import { Test, TestingModule } from '@nestjs/testing';
import { GithubModule } from './github.module';
import { LinguistAdapter } from './linguist-adapter';
import {
  GITHUB_NODE_SERVICE_TOKEN,
  GithubNodeService,
} from './github-node.service';

describe('GithubModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [GithubModule],
    }).compile();
  });

  it('should compile the module successfully', () => {
    expect(module).toBeDefined();
  });

  it('should pass resolving GITHUB_NODE_SERVICE_TOKEN to an instance of GithubNodeService', () => {
    const service = module.get<GithubNodeService>(GITHUB_NODE_SERVICE_TOKEN);
    expect(service).toBeDefined();
    expect(service).toBeInstanceOf(GithubNodeService);
  });

  it('should pass resolving LinguistAdapter', () => {
    const adapter = module.get<LinguistAdapter>(LinguistAdapter);
    expect(adapter).toBeDefined();
    expect(adapter).toBeInstanceOf(LinguistAdapter);
  });
});
