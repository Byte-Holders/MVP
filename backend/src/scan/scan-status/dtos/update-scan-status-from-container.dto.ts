import { IsEnum, IsString } from 'class-validator';
import { ScanStatusUpdateFromContainer } from '../enums/scan-status-update-from-container.enum';

export class UpdateScanStatusFromContainerDto {
  @IsString()
  repositoryId: string;

  @IsString()
  branch: string;

  // @IsIn(scanStatusUpdateFromContainer)
  @IsEnum(ScanStatusUpdateFromContainer)
  status: ScanStatusUpdateFromContainer;
}
