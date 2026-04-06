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

  // TODO gestire errori tramite comunicazione con backend
  async scan(target: Target) {
    return await this.orchestratorService.execute(target);
  }
}
