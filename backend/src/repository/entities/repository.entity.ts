export class RepositoryEntity {
  repositoryId!: string;
  ownerName!: string;
  name!: string;
  dateScan?: Date;
  documentationScore?: number;
  codeCoverage?: number;
  cvss?: number;
}
