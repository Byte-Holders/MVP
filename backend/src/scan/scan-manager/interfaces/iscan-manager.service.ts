import { StartScanDto } from '../dtos/start-scan.dto';
import { StopScanDto } from '../dtos/stop-scan.dto';
import { Scan } from '../../entities/scan.entity';

export interface IScanManagerService {
  startScan(dto: StartScanDto): Promise<Scan>;
  stopScan(dto: StopScanDto): Promise<void>;
}

export const ISCAN_MANAGER_SERVICE_TOKEN = 'IScanManagerService';
