import { Workspace } from './workspace.type';
import { ScanTarget } from './scan-target.entity';
import { ScanStatus } from './scan-status.enum';

export class Scan {
  id: string;
  workspace: Workspace;
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
