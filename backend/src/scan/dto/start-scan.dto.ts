import { Repository } from './repository.type';
import { Workspace } from './workspace.type';

export class StartScanDto {
  repository: Repository;
  branch: string;
  workspace: Workspace;
}
