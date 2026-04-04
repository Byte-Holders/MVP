import { ScanStatus } from '../scan-status/enums/scan-status.enum';

export class UpdateScanDto {
  repositoryId: string;
  branch: string;
  status: ScanStatus;
  containerRef?: string;
  endTime?: Date;
}
