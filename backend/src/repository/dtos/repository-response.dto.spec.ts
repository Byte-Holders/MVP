import { RepositoryResponseDto } from './repository-response.dto';

describe('RepositoryResponseDto', () => {
  it('should be instantiable with required fields', () => {
    const dto = new RepositoryResponseDto();
    dto.repositoryId = 'repo-1';
    dto.ownerName = 'owner';
    dto.name = 'my-repo';

    expect(dto.repositoryId).toBe('repo-1');
    expect(dto.ownerName).toBe('owner');
    expect(dto.name).toBe('my-repo');
  });

  it('should allow optional fields', () => {
    const dto = new RepositoryResponseDto();
    dto.repositoryId = 'repo-1';
    dto.ownerName = 'owner';
    dto.name = 'my-repo';
    dto.dateScan = '2024-01-01';
    dto.documentationScore = 80;
    dto.codeCoverage = 75;
    dto.cvss = 3.5;

    expect(dto.dateScan).toBe('2024-01-01');
    expect(dto.documentationScore).toBe(80);
    expect(dto.codeCoverage).toBe(75);
    expect(dto.cvss).toBe(3.5);
  });

  it('should have undefined optional fields by default', () => {
    const dto = new RepositoryResponseDto();
    dto.repositoryId = 'repo-1';
    dto.ownerName = 'owner';
    dto.name = 'my-repo';

    expect(dto.dateScan).toBeUndefined();
    expect(dto.documentationScore).toBeUndefined();
    expect(dto.codeCoverage).toBeUndefined();
    expect(dto.cvss).toBeUndefined();
  });
});
