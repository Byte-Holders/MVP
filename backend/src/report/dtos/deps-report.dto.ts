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
  @ApiProperty({ description: 'Nome del pacchetto' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ description: 'Versione del pacchetto' })
  @IsString()
  @IsNotEmpty()
  version!: string;
}

export class DepVulnerabilityDto {
  @ApiProperty({ description: 'Identificatore CVE o ID univoco della vulnerabilità' })
  @IsString()
  @IsNotEmpty()
  id!: string;

  @ApiProperty({ description: 'Severità della vulnerabilità (Critical, High, Medium, Low)' })
  @IsString()
  @IsNotEmpty()
  severity!: string;

  @ApiProperty({ description: 'Nome del pacchetto affetto' })
  @IsString()
  @IsNotEmpty()
  packageName!: string;

  @ApiProperty({ description: 'Versione del pacchetto affetta' })
  @IsString()
  @IsNotEmpty()
  packageVersion!: string;

  @ApiPropertyOptional({ description: 'Descrizione della vulnerabilità' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Versione del pacchetto che risolve la vulnerabilità' })
  @IsOptional()
  @IsString()
  fixVersion?: string;
}

export class DepsReportDto {
  @ApiPropertyOptional({ description: 'Lista completa delle dipendenze rilevate', type: [DependencyDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DependencyDto)
  list?: DependencyDto[];

  @ApiProperty({ description: 'Vulnerabilità trovate nelle dipendenze', type: [DepVulnerabilityDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DepVulnerabilityDto)
  vulnerabilities!: DepVulnerabilityDto[];

  @ApiProperty({ description: 'Analisi testuale delle vulnerabilità nelle dipendenze' })
  @IsString()
  vulnerabilityAnalysis!: string;

  @ApiPropertyOptional({ description: 'Conteggio aggregato delle vulnerabilità per severità', type: () => VulnCountsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => VulnCountsDto)
  vulnCounts?: VulnCountsDto;
}
