import { IsIn, IsString } from 'class-validator';
import {
  type ScanStatusUpdateFromContainer,
  scanStatusUpdateFromContainer,
} from '../types/scan-status-update-from-container.type';

export class UpdateScanStatusFromContainerDto {
  @IsString()
  repositoryId: string;

  @IsString()
  branch: string;

  @IsIn(scanStatusUpdateFromContainer)
  status: ScanStatusUpdateFromContainer;
}
