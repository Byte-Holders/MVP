export class CreateScanDto {
  repositoryId: string;
  workspaceId: string;
  branch: string;
  containerRef: string; // ECS Task ARN
}
