export class ScanTarget {
  repositoryName: string;
  branchName: string;

  constructor(repositoryName: string, branchName: string) {
    this.repositoryName = repositoryName;
    this.branchName = branchName;
  }
}
