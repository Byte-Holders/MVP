export class RepositoryResponseDto {
  repositoryId!: string;
  ownerName!: string;
  name!: string;
  branches!: string[];
  dateScan?: string;
  documentationScore?: number;
  codeCoverage?: number;
  cvss?: number;
}
