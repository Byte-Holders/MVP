import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Target } from './scan/target.types';
import {
  ISCAN_SERVICE_TOKEN,
  type IScanService,
} from './scan/iscan-service.interface';
import {
  IREPORTER_SERVICE_TOKEN,
  type IReporterService,
} from './reporter/ireporter-service.interface';

@Injectable()
export class AppService {
  constructor(
    @Inject(ISCAN_SERVICE_TOKEN) private readonly scanService: IScanService,
    @Inject(IREPORTER_SERVICE_TOKEN)
    private readonly reporterService: IReporterService,
    private readonly configService: ConfigService,
  ) {}

  async run() {
    const owner = this.configService.get<string>('TARGET_OWNER');
    const repository = this.configService.get<string>('TARGET_REPOSITORY');
    const branch = this.configService.get<string>('TARGET_BRANCH');

    // Da gestire meglio
    if (!owner || !repository || !branch) {
      throw new Error(
        `Mancano informazioni per lanciare scansioni.\nOwner: ${owner}\nRepository: ${repository}\nBranch: ${branch}`,
      );
    }

    const token = this.configService.get<string>('RECEIVER_TOKEN');
    if (!token) {
      throw new Error('Manca il token per comunicazione con backend.');
    }

    const target: Target = {
      owner,
      repository,
      branch,
    };

    const report = await this.scanService.scan(target);
    if (!report) throw new Error('Non è stato generato alcun report');

    await this.reporterService.sendReport(report, token);
  }
}
