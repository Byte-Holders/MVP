import { Test } from '@nestjs/testing';
import { AppService } from './app.service';
import {
  IREPORTER_SERVICE_TOKEN as IREPORTER_SERVICE_TOKEN,
  IReporterService,
} from './reporter/ireporter-service.interface';
import {
  ISCAN_SERVICE_TOKEN,
  IScanService,
} from './scan/iscan-service.interface';
import { ConfigService } from '@nestjs/config';

describe('AppService', () => {
  let appService: AppService;
  let reporter: jest.Mocked<IReporterService>;
  let scanner: jest.Mocked<IScanService>;

  beforeEach(async () => {
    reporter = {
      sendReport: jest.fn(),
    };

    scanner = {
      scan: jest.fn(),
    };

    const app = await Test.createTestingModule({
      providers: [
        AppService,
        { provide: ISCAN_SERVICE_TOKEN, useValue: scanner },
        { provide: IREPORTER_SERVICE_TOKEN, useValue: reporter },
        ConfigService,
      ],
    }).compile();

    appService = app.get<AppService>(AppService);
  });

  it('is defined', () => {
    expect(appService).toBeDefined();
  });
});
