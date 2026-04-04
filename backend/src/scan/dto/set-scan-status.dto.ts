import { Repository } from './repository.type';
import { ScanStatus } from './scan-status.enum';

export class SetScanStatusDto {
  repository: Repository;
  branch: string;
  status: ScanStatus;
  callbackToken?: string;
}
