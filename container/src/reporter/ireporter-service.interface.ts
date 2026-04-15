import { Report } from 'src/scan/nodes/orchestrator/synthesizer/synthesizer.types';

export type SendReportInfo = {
  target: string;
  report: Report;
  token: string;
};

export type SendErrorNotificationInfo = {
  target: string;
  token: string;
};

export interface IReporterService {
  sendReport(info: SendReportInfo): Promise<void>;
  sendErrorNotification(info: SendErrorNotificationInfo): Promise<void>;
}

export const IREPORTER_SERVICE_TOKEN = 'IReporter';
