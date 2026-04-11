import type { RepositoryEntity } from '../entities/repository.entity';
import type { RepositoryInfo } from '../types/repository-info';

export class RepositoryMapper {
  static toInfo(entity: RepositoryEntity): RepositoryInfo {
    return {
      repositoryId: entity.repositoryId,
      ownerName: entity.ownerName,
      name: entity.name,
      dateScan: entity.dateScan?.toISOString(),
      documentationScore: entity.documentationScore,
      codeCoverage: entity.codeCoverage,
      cvss: entity.cvss,
    };
  }
}
