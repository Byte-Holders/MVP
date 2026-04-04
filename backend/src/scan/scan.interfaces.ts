import { ScanStatus, Scan } from './scan.dto';
import {
  StartScanDto,
  StopScanDto,
  CreateScanDto,
  UpdateScanDto,
  FindScanDto,
  SetScanStatusDto,
} from './scan.dto';



export interface IScanStatusService {
  startScan(dto: StartScanDto): Promise<Scan>;
  stopScan(dto: StopScanDto): Promise<void>;
}

export interface IScanRepository {
  create(dto: CreateScanDto): Promise<Scan>;
  get(dto: FindScanDto): Promise<Scan | null>;
  update(dto: UpdateScanDto): Promise<void>;
  getScanStatus(dto: SetScanStatusDto): Promise<ScanStatus | null>;
}
