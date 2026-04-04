import { Repository } from './repository.type';

export class GetScanStatusDto {
  repository: Repository;
  branch: string;
}
