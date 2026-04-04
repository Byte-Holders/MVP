import { Repository } from './repository.type';

export class FindScanDto {
  repository: Repository;
  branch: string;
}
