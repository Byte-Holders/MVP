import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import * as rx from 'rxjs';
import {
  IReporterService,
  SendErrorNotificationInfo,
  SendReportInfo,
} from './ireporter-service.interface';

@Injectable()
export class ReporterService implements IReporterService {
  constructor(private readonly httpService: HttpService) {}

  async sendReport(info: SendReportInfo) {
    const logger = new Logger(ReporterService.name);
    logger.log(`Successo. Comunico a ${info.target}`);
    await rx.lastValueFrom(
      this.httpService.post(info.target, {
        report: info.report,
        token: info.token,
      }),
    );
  }

  async sendErrorNotification(info: SendErrorNotificationInfo): Promise<void> {
    const logger = new Logger(ReporterService.name);
    logger.error(`Errore. Comunico a ${info.target}`);
    await rx.lastValueFrom(
      this.httpService.patch(info.target, {
        token: info.token,
      }),
    );
  }
}
