import { Target } from './target.types';
import { Report } from './nodes/orchestrator/synthesizer/synthesizer.types';

export type RepositoryConnectionInfo = {
  owner: string | undefined;
  repository: string | undefined;
  branch: string | undefined;
  accessToken: string | undefined;
};

export interface IScanService {
  scan(target: Target): Promise<Report | undefined>;
  validateBedrockAccess(bearerToken: string | undefined): Promise<void>;
  validateGithubAccess(connectionInfo: RepositoryConnectionInfo): Promise<void>;
}

export const ISCAN_SERVICE_TOKEN = 'IScanService';
