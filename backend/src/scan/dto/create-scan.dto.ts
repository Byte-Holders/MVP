import { Repository } from './repository.type';
import { Workspace } from './workspace.type';

export class CreateScanDto {
  repository: Repository;
  branch: string;
  workspace: Workspace;
  containerRef: string; // ECS Task ARN
}
