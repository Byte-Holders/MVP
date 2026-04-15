import { Test, TestingModule } from '@nestjs/testing';
import { ScanModule } from './scan.module';
import { ISCAN_SERVICE_TOKEN } from './iscan-service.interface';
import { ScanService } from './scan.service';

jest.mock('@nestjs/axios', () => ({ HttpModule: class {} }));
jest.mock('@nestjs/config', () => ({ ConfigModule: class {} }));

jest.mock('./nodes/orchestrator/orchestrator.module', () => ({
  OrchestratorModule: class {},
}));
jest.mock('../reporter/reporter.module', () => ({ ReporterModule: class {} }));

jest.mock('./scan.service');

describe('ScanModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    jest.clearAllMocks();

    module = await Test.createTestingModule({
      imports: [ScanModule],
    }).compile();
  });

  it('should compile the module successfully', () => {
    expect(module).toBeDefined();
  });

  it('should pass resolving ISCAN_SERVICE_TOKEN to an instance of ScanService', () => {
    const service = module.get<ScanService>(ISCAN_SERVICE_TOKEN);

    expect(service).toBeDefined();
    expect(service).toBeTruthy();
  });
});
