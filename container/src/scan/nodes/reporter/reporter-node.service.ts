import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { Report } from '../synthesizer/synthesizer.types';
import * as rx from 'rxjs';

@Injectable()
export class ReporterNodeService {
  constructor(private readonly httpService: HttpService) {}

  async sendReport(report: Report) {
    console.log('RECEIVER_URL = ' + process.env.RECEIVER_URL);
    if (process.env.RECEIVER_URL)
      await rx.lastValueFrom(
        this.httpService.post(process.env.RECEIVER_URL, report),
      );
  }
}
