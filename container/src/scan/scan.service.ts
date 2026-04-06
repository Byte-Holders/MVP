import { Injectable } from '@nestjs/common';
import { OrchestratorService } from './nodes/orchestrator/orchestrator.service';
import { ConfigService } from '@nestjs/config';
import { Target } from './target.types';

@Injectable()
export class ScanService {
  constructor(
    private readonly orchestratorService: OrchestratorService,
    private readonly configService: ConfigService,
  ) {}

  async scan() {
    const owner = this.configService.get<string>('TARGET_OWNER');
    const repository = this.configService.get<string>('TARGET_REPOSITORY');
    const branch = this.configService.get<string>('TARGET_BRANCH');

    if (!owner || !repository || !branch) {
      throw new Error(
        `Mancano informazioni per lanciare scansioni.\nOwner: ${owner}\nRepository: ${repository}\nBranch: ${branch}`,
      );
    }

    const target: Target = {
      owner,
      repository,
      branch,
    };

    await this.orchestratorService.execute(target);
  }
}
