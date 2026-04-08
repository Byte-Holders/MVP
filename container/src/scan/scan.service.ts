import { Injectable, Logger } from '@nestjs/common';
import { OrchestratorService } from './nodes/orchestrator/orchestrator.service';
import { Target } from './target.types';

@Injectable()
export class ScanService {
  private readonly logger = new Logger(ScanService.name);

  constructor(private readonly orchestratorService: OrchestratorService) {}

  // TODO gestire errori tramite comunicazione con backend
  async scan(target: Target) {
    this.logger.log(
      `Lancio scansione verso ${target.owner}/${target.repository}@${target.branch}`,
    );
    return await this.orchestratorService.execute(target);
  }
}
