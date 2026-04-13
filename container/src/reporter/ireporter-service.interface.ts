import { Report } from 'src/scan/nodes/orchestrator/synthesizer/synthesizer.types';

export interface IReporterService {
  sendReport(report: Report, token: string): Promise<void>;
}

export const IREPORTER_SERVICE_TOKEN = 'IReporter';
