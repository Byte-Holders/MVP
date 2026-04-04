import { Repository } from './repository.type';

export class StopScanDto {
  repository: Repository;
  branch: string;
}
