import { Injectable, Logger } from '@nestjs/common';
import { Report } from './synthesizer.types';
import { WorkflowState } from '../workflow-state.type';
import { SynthesizerNodeHelper } from './synthesizer-node.helper';

@Injectable()
export class SynthesizerNodeService {
  private readonly logger = new Logger(SynthesizerNodeService.name);

  constructor(private readonly helper: SynthesizerNodeHelper) {}

  async summarize(state: WorkflowState): Promise<Report> {
    this.logger.log('Inizio costruzione report finale');
    const reportSummary = await this.helper.generateReportSummary(state);
    const report = this.helper.assembleReport(state, reportSummary);
    this.logger.log('Terminata costruzione del report');
    return report;
  }
}
