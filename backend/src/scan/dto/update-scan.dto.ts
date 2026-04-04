import { Repository } from './repository.type';
import { ScanStatus } from './scan-status.enum';

export class UpdateScanDto {
  repository: Repository;
  branch: string;
  status: ScanStatus;
  containerRef?: string;
  endTime?: Date;
}
