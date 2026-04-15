import { Injectable, Logger } from '@nestjs/common';
import { OrchestratorService } from './nodes/orchestrator/orchestrator.service';
import { Target } from './target.types';
import {
  AwsKeysValidityCheckInfo,
  IScanService,
} from './iscan-service.interface';
import { STSClient, GetCallerIdentityCommand } from '@aws-sdk/client-sts';
import axios from 'axios';

@Injectable()
export class ScanService implements IScanService {
  private readonly logger = new Logger(ScanService.name);

  constructor(private readonly orchestratorService: OrchestratorService) {}

  async scan(target: Target) {
    this.logger.log(
      `Lancio scansione verso ${target.owner}/${target.repository}@${target.branch}`,
    );
    return await this.orchestratorService.execute(target);
  }

  async validateCredentials(info: AwsKeysValidityCheckInfo): Promise<void> {
    const sts = new STSClient({ credentials: info });
    const validationCommand = new GetCallerIdentityCommand({});

    const axiosInstance = axios.create({
      baseURL: 'https://bedrock.eu-north-1.amazonaws.com',
      headers: {
        Authorization: `Bearer ${info.bedrockBearerToken}`,
        'Content-Type': 'application/json',
      },
    });

    try {
      await sts.send(validationCommand);
      await axiosInstance.get('/foundation-models');
    } catch {
      throw new Error('Credenziali AWS non valide');
    }
  }
}
