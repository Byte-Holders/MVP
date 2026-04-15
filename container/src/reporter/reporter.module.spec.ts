import { Test, TestingModule } from '@nestjs/testing';
import { ReporterModule } from './reporter.module';
import { ReporterService } from './reporter.service';
import { IREPORTER_SERVICE_TOKEN } from './ireporter-service.interface';
import { ConfigService } from '@nestjs/config';

describe('ReporterModule', () => {
    let module: TestingModule;

    beforeEach(async () => {
        module = await Test.createTestingModule({
            imports: [ReporterModule],
            providers: [
                {
                    provide: ConfigService,
                    useValue: { get: jest.fn() },
                },
            ],
        }).compile();
    });

    it('should compile the module successfully', () => {
        expect(module).toBeDefined();
    });

    it('should pass resolving IREPORTER_SERVICE_TOKEN to an instance of ReporterService', () => {
        const service = module.get<ReporterService>(IREPORTER_SERVICE_TOKEN);

        expect(service).toBeDefined();
        expect(service).toBeInstanceOf(ReporterService);
    });
});