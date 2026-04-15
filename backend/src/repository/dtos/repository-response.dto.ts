import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RepositoryResponseDto {
  @ApiProperty({ description: 'ID univoco del repository' })
  repositoryId!: string;

  @ApiProperty({ description: 'Username del proprietario su GitHub' })
  ownerName!: string;

  @ApiProperty({ description: 'Nome del repository' })
  name!: string;

  @ApiPropertyOptional({ description: 'Data dell\'ultima scansione (ISO 8601)' })
  dateScan?: string;

  @ApiPropertyOptional({ description: 'Punteggio documentazione (0-100)' })
  documentationScore?: number;

  @ApiPropertyOptional({ description: 'Percentuale code coverage (0-100)' })
  codeCoverage?: number;

  @ApiPropertyOptional({ description: 'Punteggio CVSS aggregato' })
  cvss?: number;
}
