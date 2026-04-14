import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Report } from '../scan/nodes/orchestrator/synthesizer/synthesizer.types';
import * as rx from 'rxjs';
import {
  IReporterService,
  SendErrorNotificationInfo,
  SendReportInfo,
} from './ireporter-service.interface';

@Injectable()
export class ReporterService implements IReporterService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async sendReport(info: SendReportInfo) {
    await rx.lastValueFrom(
      this.httpService.post(info.target, {
        report: info.report,
        token: info.token,
      }),
    );
  }

  async sendErrorNotification(info: SendErrorNotificationInfo): Promise<void> {
    await rx.lastValueFrom(
      this.httpService.post(info.target, {
        token: info.token,
      }),
    );
  }
}
