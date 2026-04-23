import { Inject, Injectable, Logger } from '@nestjs/common';
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
  RECEIVER_URL_SUCCESS: string;
  RECEIVER_URL_FAILURE: string;
  TARGET_ACCESS_TOKEN: string;
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
    const logger = new Logger(AppService.name);

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
      TARGET_ACCESS_TOKEN,
      RECEIVER_URL_SUCCESS,
      RECEIVER_URL_FAILURE,
    } = decoded;

    if (!RECEIVER_URL_FAILURE || !RECEIVER_URL_SUCCESS) {
      const errorString = `Mancano informazioni per riportare l'esito`;
      logger.error(errorString);
      throw new Error(errorString);
    }

    try {
      await this.scanService.validateGithubAccess({
        owner: TARGET_OWNER,
        repository: TARGET_REPOSITORY,
        branch: TARGET_BRANCH,
        accessToken: TARGET_ACCESS_TOKEN,
      });

      await this.scanService.validateBedrockAccess(
        this.configService.get<string>('AWS_BEARER_TOKEN_BEDROCK'),
      );

      const target: Target = {
        owner: TARGET_OWNER,
        repository: TARGET_REPOSITORY,
        branch: TARGET_BRANCH,
        accessToken: TARGET_ACCESS_TOKEN,
      };

      const report = await this.scanService.scan(target);
      if (!report) throw new Error('Non è stato generato alcun report');
      await this.reporterService.sendReport({
        report,
        token: reportCallbackToken,
        target: RECEIVER_URL_SUCCESS,
      });
    } catch (e: unknown) {
      logger.error(e);
      await this.reporterService.sendErrorNotification({
        token: reportCallbackToken,
        target: RECEIVER_URL_FAILURE,
      });
    }
  }
}
