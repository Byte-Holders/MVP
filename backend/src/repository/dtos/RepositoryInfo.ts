export interface RepositoryInfo {
  repositoryId: string;
  repoId: string; // formato owner/repo
  ownerName: string;
  name: string;
  branches: string[];
  dateScan?: string;
  documentationScore?: number;
  codeCoverage?: number;
  cvss?: number;
}
