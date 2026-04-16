export type RepositoryInfo = {
  repositoryId: string;
  ownerName: string;
  name: string;
  dateScan?: string;
  documentationScore?: number;
  codeCoverage?: number;
  cvss?: number;
  accessToken?: string;
};
