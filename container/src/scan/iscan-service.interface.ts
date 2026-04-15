import { Target } from './target.types';
import { Report } from './nodes/orchestrator/synthesizer/synthesizer.types';

export type AwsKeysValidityCheckInfo = {
  accessKeyId: string;
  secretAccessKey: string;
  sessionToken: string;
  bedrockBearerToken: string;
};

export interface IScanService {
  scan(target: Target): Promise<Report | undefined>;
  validateCredentials(info: AwsKeysValidityCheckInfo): Promise<void>;
}

export const ISCAN_SERVICE_TOKEN = 'IScanService';
