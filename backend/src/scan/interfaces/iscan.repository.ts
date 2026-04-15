import { Scan } from '../entities/scan.entity';

export interface IScanRepository {
  create(scan: Scan): Promise<Scan>;
  find(id: string): Promise<Scan | null>;
  findByToken(callbackToken: string): Promise<Scan | null>;
  update(id: string, updated: Partial<Scan>): Promise<Scan | null>;
}

export const ISCAN_REPOSITORY_TOKEN = 'IScanRepository';
