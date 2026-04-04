import {
  ScanStatus,
  StartScanDto,
  StopScanDto,
  CreateScanDto,
  UpdateScanDto,
  FindScanDto,
  SetScanStatusDto,
  Scan,
} from './dto';


export interface IScanManagerService {
  startScan(dto: StartScanDto): Promise<Scan>;
  stopScan(dto: StopScanDto): Promise<void>;
}


export interface IScanRepository {
  create(dto: CreateScanDto): Promise<Scan>;
  get(dto: FindScanDto): Promise<Scan | null>;
  update(dto: UpdateScanDto): Promise<void>;
  getScanStatus(dto: SetScanStatusDto): Promise<ScanStatus | null>;
}
