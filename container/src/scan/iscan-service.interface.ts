import { Target } from './target.types';
import { Report } from './nodes/orchestrator/synthesizer/synthesizer.types';

export interface IScanService {
  scan(target: Target): Promise<Report | undefined>;
}

export const ISCAN_SERVICE_TOKEN = 'IScanService';
