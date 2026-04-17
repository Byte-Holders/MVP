import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { VulnCountsDto } from './vuln-counts.dto';

export class DependencyDto {
  @ApiProperty({ description: 'Nome del pacchetto', example: 'lodash' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ description: 'Versione del pacchetto', example: '4.17.21' })
  @IsString()
  @IsNotEmpty()
  version!: string;
}

export class DepVulnerabilityDto {
  @ApiProperty({ description: 'Identificatore CVE o ID univoco della vulnerabilità', example: 'CVE-2021-23337' })
  @IsString()
  @IsNotEmpty()
  id!: string;

  @ApiProperty({ description: 'Severità della vulnerabilità (Critical, High, Medium, Low)', example: 'High' })
  @IsString()
  @IsNotEmpty()
  severity!: string;

  @ApiProperty({ description: 'Nome del pacchetto affetto', example: 'lodash' })
  @IsString()
  @IsNotEmpty()
  packageName!: string;

  @ApiProperty({ description: 'Versione del pacchetto affetta', example: '4.17.20' })
  @IsString()
  @IsNotEmpty()
  packageVersion!: string;

  @ApiPropertyOptional({
    description: 'Descrizione della vulnerabilità',
    example: 'Command injection via template function in lodash versions prior to 4.17.21',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Versione del pacchetto che risolve la vulnerabilità', example: '4.17.21' })
  @IsOptional()
  @IsString()
  fixVersion?: string;
}

export class DepsReportDto {
  @ApiPropertyOptional({
    description: 'Lista completa delle dipendenze rilevate',
    type: [DependencyDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DependencyDto)
  list?: DependencyDto[];

  @ApiProperty({
    description: 'Vulnerabilità trovate nelle dipendenze',
    type: [DepVulnerabilityDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DepVulnerabilityDto)
  vulnerabilities!: DepVulnerabilityDto[];

  @ApiProperty({
    description: 'Analisi testuale delle vulnerabilità nelle dipendenze',
    example: 'Sono state rilevate 2 vulnerabilità critiche in lodash e axios. Si consiglia un aggiornamento immediato.',
  })
  @IsString()
  vulnerabilityAnalysis!: string;

  @ApiPropertyOptional({
    description: 'Conteggio aggregato delle vulnerabilità per severità',
    type: () => VulnCountsDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => VulnCountsDto)
  vulnCounts?: VulnCountsDto;
}
