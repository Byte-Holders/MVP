export class RepositoryResponseDto {
  repositoryId!: string;
  ownerName!: string;
  name!: string;
  dateScan?: string;
  documentationScore?: number;
  codeCoverage?: number;
  cvss?: number;
}
