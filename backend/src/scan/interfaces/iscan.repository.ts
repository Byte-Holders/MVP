import { CreateScanDto } from '../dtos/create-scan.dto';
import { FindStatusDto } from '../dtos/find-status.dto';
import { UpdateScanDto } from '../dtos/update-scan.dto';
import { Scan } from '../entities/scan.entity';

export interface IScanRepository {
  create(dto: CreateScanDto): Promise<void>;
  find(dto: FindStatusDto): Promise<Scan | null>;
  update(dto: UpdateScanDto): Promise<void>;
}

export const ISCAN_REPOSITORY_TOKEN = 'IScanRepository';
