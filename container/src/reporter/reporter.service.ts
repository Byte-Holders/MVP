import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Report } from '../scan/nodes/orchestrator/synthesizer/synthesizer.types';
import * as rx from 'rxjs';
import { IReporterService } from './ireporter-service.interface';

@Injectable()
export class ReporterService implements IReporterService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async sendReport(report: Report, token: string) {
    const url = this.configService.get<string>('RECEIVER_URL');
    if (url)
      await rx.lastValueFrom(this.httpService.post(url, { report, token }));
  }
}
