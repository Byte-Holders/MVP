import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Target } from './scan/target.types';
import {
  ISCAN_SERVICE_TOKEN,
  type IScanService,
} from './scan/iscan-service.interface';
import {
  IREPORTER_SERVICE_TOKEN,
  type IReporterService,
} from './reporter/ireporter-service.interface';

interface ReportCallbackToken {
  TARGET_OWNER: string;
  TARGET_REPOSITORY: string;
  TARGET_BRANCH: string;
  RECEIVER_URL: string;
  AWS_ACCESS_KEY_ID: string;
  AWS_SECRET_ACCESS_KEY: string;
  AWS_SESSION_TOKEN: string;
  AWS_BEARER_TOKEN_BEDROCK: string;
  repositoryId: string;
}

@Injectable()
export class AppService {
  constructor(
    @Inject(ISCAN_SERVICE_TOKEN) private readonly scanService: IScanService,
    @Inject(IREPORTER_SERVICE_TOKEN)
    private readonly reporterService: IReporterService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  async run() {
    const reportCallbackToken = this.configService.get<string>(
      'REPORT_CALLBACK_TOKEN',
    );
    if (!reportCallbackToken) {
      throw new Error('Non è stato iniettato il REPORT_CALLBACK_TOKEN.');
    }

    const decoded =
      this.jwtService.decode<ReportCallbackToken>(reportCallbackToken);
    if (!decoded) {
      throw new Error('REPORT_CALLBACK_TOKEN mal formattato.');
    }

    const {
      TARGET_OWNER,
      TARGET_REPOSITORY,
      TARGET_BRANCH,
      RECEIVER_URL,
      AWS_ACCESS_KEY_ID,
      AWS_SECRET_ACCESS_KEY,
      AWS_SESSION_TOKEN,
      AWS_BEARER_TOKEN_BEDROCK,
      repositoryId,
    } = decoded;

    if (
      !TARGET_OWNER ||
      !TARGET_REPOSITORY ||
      !TARGET_BRANCH ||
      !repositoryId
    ) {
      throw new Error(
        `Mancano informazioni per lanciare scansioni.\nOwner: ${TARGET_OWNER}\nRepository: ${TARGET_REPOSITORY}\nBranch: ${TARGET_BRANCH}\nRepositoryId: ${repositoryId}`,
      );
    }

    process.env.AWS_ACCESS_KEY_ID = AWS_ACCESS_KEY_ID;
    process.env.AWS_SECRET_ACCESS_KEY = AWS_SECRET_ACCESS_KEY;
    process.env.AWS_SESSION_TOKEN = AWS_SESSION_TOKEN;
    process.env.AWS_BEARER_TOKEN_BEDROCK = AWS_BEARER_TOKEN_BEDROCK;

    this.configService.set('RECEIVER_URL', RECEIVER_URL);

    const target: Target = {
      owner: TARGET_OWNER,
      repository: TARGET_REPOSITORY,
      branch: TARGET_BRANCH,
      repositoryId,
    };

    const report = await this.scanService.scan(target);
    if (!report) throw new Error('Non è stato generato alcun report');

    await this.reporterService.sendReport(report, reportCallbackToken);
  }
}
