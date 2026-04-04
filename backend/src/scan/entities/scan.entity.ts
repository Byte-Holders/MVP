import { ScanStatus } from '../scan-status/enums/scan-status.enum';
import { ScanTarget } from './scan-target.entity';

export class Scan {
  id: string;
  workspaceId: string;
  target: ScanTarget;
  callbackToken?: string;

  startTime: Date;
  endTime?: Date;

  status: ScanStatus;
  containerRef: string;

  constructor(partial: Partial<Scan>) {
    Object.assign(this, partial);
  }
}
