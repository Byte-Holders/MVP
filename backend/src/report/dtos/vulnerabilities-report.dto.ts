import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { VulnCountsDto } from './vuln-counts.dto';

export class CodeVulnerabilityDto {
  @ApiProperty({ description: 'Identificatore univoco della vulnerabilità', example: 'VULN-2024-0042' })
  @IsString()
  @IsNotEmpty()
  id!: string;

  @ApiProperty({ description: 'Percorso del file in cui è stata rilevata la vulnerabilità', example: 'src/auth/auth.service.ts' })
  @IsString()
  @IsNotEmpty()
  path!: string;

  @ApiProperty({
    description: 'Descrizione della vulnerabilità',
    example: 'SQL query costruita con concatenazione diretta di input utente, esposta a SQL Injection.',
  })
  @IsString()
  description!: string;

  @ApiProperty({
    description: 'Suggerimento di remediation',
    example: 'Utilizzare query parametrizzate o un ORM per evitare la concatenazione diretta di input.',
  })
  @IsString()
  remediation!: string;

  @ApiProperty({ description: 'Punteggio di severità CVSS (0–10)', minimum: 0, maximum: 10, example: 8.1 })
  @IsNumber()
  @Min(0)
  @Max(10)
  severity!: number;

  @ApiProperty({ description: 'Impatto potenziale della vulnerabilità', example: 'Accesso non autorizzato al database e furto di dati sensibili.' })
  @IsString()
  impact!: string;

  @ApiProperty({ description: 'Categoria della vulnerabilità', example: 'Injection' })
  @IsString()
  category!: string;

  @ApiPropertyOptional({ description: 'Identificatore CWE associato', example: 'CWE-89' })
  @IsOptional()
  @IsString()
  cwe?: string;

  @ApiPropertyOptional({ description: 'Categorie OWASP Top 10 associate', type: [String], example: ['A03:2021-Injection'] })
  @Transform(({ value }) => value ?? [])
  @IsArray()
  @IsString({ each: true })
  owasp?: string[];
}

export class VulnerabilitiesReportDto {
  @ApiProperty({
    description: 'Vulnerabilità rilevate nel codice sorgente',
    type: [CodeVulnerabilityDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CodeVulnerabilityDto)
  vulnerabilities!: CodeVulnerabilityDto[];

  @ApiProperty({ description: 'Voto di sicurezza del codice (0–10)', minimum: 0, maximum: 10, example: 6.2 })
  @IsNumber()
  @Min(0)
  @Max(10)
  mark!: number;

  @ApiPropertyOptional({
    description: 'Conteggio aggregato delle vulnerabilità per severità',
    type: () => VulnCountsDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => VulnCountsDto)
  vulnCounts?: VulnCountsDto;
}
