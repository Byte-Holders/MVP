import { Test, TestingModule } from '@nestjs/testing';
import { OrchestratorModule } from './orchestrator.module';
import { OrchestratorService } from './orchestrator.service';
import { OrchestratorHelper } from './orchestrator.helper';

jest.mock('./coverage/coverage.module', () => ({ CoverageModule: class {} }));
jest.mock('./dependency/dependency.module', () => ({ DepsModule: class {} }));
jest.mock('./docs/docs.module', () => ({ DocsModule: class {} }));
jest.mock('./github/github.module', () => ({ GithubModule: class {} }));
jest.mock('./remediation/remediation.module', () => ({
  RemediationModule: class {},
}));
jest.mock('./security/security.module', () => ({ SecurityModule: class {} }));
jest.mock('./synthesizer/synthesizer.module', () => ({
  SynthesizerModule: class {},
}));

jest.mock('./orchestrator.service');
jest.mock('./orchestrator.helper');

describe('OrchestratorModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    jest.clearAllMocks();

    module = await Test.createTestingModule({
      imports: [OrchestratorModule],
    }).compile();
  });

  it('should compile the module successfully', () => {
    expect(module).toBeDefined();
  });

  it('should pass resolving OrchestratorService', () => {
    const service = module.get<OrchestratorService>(OrchestratorService);

    expect(service).toBeDefined();
    expect(service).toBeTruthy();
  });

  it('should pass resolving OrchestratorHelper', () => {
    const helper = module.get<OrchestratorHelper>(OrchestratorHelper);

    expect(helper).toBeDefined();
    expect(helper).toBeTruthy();
  });
});
