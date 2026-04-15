import { Test, TestingModule } from '@nestjs/testing';
import { ReporterService } from './reporter.service';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { of, throwError } from 'rxjs';
import {
    SendReportInfo,
    SendErrorNotificationInfo,
} from './ireporter-service.interface';
import { Report } from '../scan/nodes/orchestrator/synthesizer/synthesizer.types';

describe('ReporterService', () => {
    let service: ReporterService;
    let httpService: jest.Mocked<HttpService>;

    beforeEach(async () => {
        jest.clearAllMocks();

        const mockHttpService = {
            post: jest.fn(),
            patch: jest.fn(),
        };

        const mockConfigService = {
            get: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ReporterService,
                { provide: HttpService, useValue: mockHttpService },
                { provide: ConfigService, useValue: mockConfigService },
            ],
        }).compile();

        service = module.get<ReporterService>(ReporterService);
        httpService = module.get(HttpService) as unknown as jest.Mocked<HttpService>;
    });


    describe('sendReport', () => {
        it('should successfully post the report payload to the target url', async () => {
            httpService.post.mockReturnValueOnce(of({ data: 'success' } as any));

            const mockReport = { summary: { mark: 10 } } as unknown as Report;
            const info: SendReportInfo = {
                target: 'https://webhook.example.com/api/report',
                report: mockReport,
                token: 'test-token',
            };

            await service.sendReport(info);

            expect(httpService.post).toHaveBeenCalledWith(
                'https://webhook.example.com/api/report',
                {
                    report: mockReport,
                    token: 'test-token',
                },
            );
            expect(httpService.post).toHaveBeenCalledTimes(1);
        });

        it('should throw when the http request fails', async () => {
            httpService.post.mockReturnValueOnce(
                throwError(() => new Error('Network error')),
            );

            const info: SendReportInfo = {
                target: 'https://webhook.example.com/api/report',
                report: {} as Report,
                token: 'test-token',
            };

            await expect(service.sendReport(info)).rejects.toThrow('Network error');
        });
    });


    describe('sendErrorNotification', () => {
        it('should successfully patch the error notification payload to the target url', async () => {
            httpService.patch.mockReturnValueOnce(of({ data: 'success' } as any));

            const info: SendErrorNotificationInfo = {
                target: 'https://webhook.example.com/api/error',
                token: 'error-token',
            };

            await service.sendErrorNotification(info);

            expect(httpService.patch).toHaveBeenCalledWith(
                'https://webhook.example.com/api/error',
                {
                    token: 'error-token',
                },
            );
            expect(httpService.patch).toHaveBeenCalledTimes(1);
        });

        it('should throw when the http request fails', async () => {
            httpService.patch.mockReturnValueOnce(
                throwError(() => new Error('Network error')),
            );

            const info: SendErrorNotificationInfo = {
                target: 'https://webhook.example.com/api/error',
                token: 'error-token',
            };

            await expect(service.sendErrorNotification(info)).rejects.toThrow(
                'Network error',
            );
        });
    });
});