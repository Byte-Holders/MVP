import { Test, TestingModule } from '@nestjs/testing';
import { CoverageModule } from './coverage.module';
import { CoverageNodeHelper } from './coverage-node.helper';
import {
  COVERAGE_NODE_SERVICE_TOKEN,
  CoverageNodeService,
} from './coverage-node.service';

describe('CoverageModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [CoverageModule],
    }).compile();
  });

  it('should compile the module successfully', () => {
    expect(module).toBeDefined();
  });

  it('should pass resolving COVERAGE_NODE_SERVICE_TOKEN to an instance of CoverageNodeService', () => {
    const service = module.get<CoverageNodeService>(
      COVERAGE_NODE_SERVICE_TOKEN,
    );
    expect(service).toBeDefined();
    expect(service).toBeInstanceOf(CoverageNodeService);
  });

  it('should pass resolving CoverageNodeHelper', () => {
    const helper = module.get<CoverageNodeHelper>(CoverageNodeHelper);
    expect(helper).toBeDefined();
    expect(helper).toBeInstanceOf(CoverageNodeHelper);
  });
});
