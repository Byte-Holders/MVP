
export type Repository = {
  id: string;
  owner: string;
  name: string;
};

export type Workspace = {
  id: string;
  name: string;
};


export enum ScanStatus {
  Started = 'started',
  Completed = 'completed',
  Stopped = 'stopped',
  Error = 'error',
}

export class StartScanDto {
  repository: Repository;
  branch: string;
  workspace: Workspace;
}

export class StopScanDto {
  repository: Repository;
  branch: string;
}

export class CreateScanDto {
  repository: Repository;
  branch: string;
  workspace: Workspace;
  containerRef: string; // ECS Task ARN
}

export class UpdateScanDto {
  repository: Repository;
  branch: string;
  status: ScanStatus;
  containerRef?: string;
  endTime?: Date;
}

export class FindScanDto {
  repository: Repository;
  branch: string;
}

export class SetScanStatusDto {
  repository: Repository;
  branch: string;
  status: ScanStatus;
  callbackToken?: string;
}

export class GetScanStatusDto {
  repository: Repository;
  branch: string;
}
export class ScanTarget {
  repositoryName: string;
  branchName: string;

  constructor(repositoryName: string, branchName: string) {
    this.repositoryName = repositoryName;
    this.branchName = branchName;
  }
}

// Scan

export class Scan {
  id: string;
  workspace: Workspace;
  target: ScanTarget;
  callbackToken?: string;

  startTime: Date;
  endTime?: Date;

  status: ScanStatus;
  containerRef: string;

  constructor(partial: Partial<Scan>) {
    Object.assign(this, partial);
  }
}