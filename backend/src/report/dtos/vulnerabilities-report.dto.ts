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
import { VulnCountsDto } from './vuln-counts.dto';

export class CodeVulnerabilityDto {
  @IsString()
  @IsNotEmpty()
  id!: string;

  @IsString()
  @IsNotEmpty()
  path!: string;

  @IsString()
  description!: string;

  @IsString()
  remediation!: string;

  @IsNumber()
  @Min(0)
  @Max(10)
  severity!: number;

  @IsString()
  impact!: string;

  @IsString()
  category!: string;

  @IsOptional()
  @IsString()
  cwe?: string;

  @Transform(({ value }) => value ?? [])
  @IsArray()
  @IsString({ each: true })
  owasp?: string[];
}

export class VulnerabilitiesReportDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CodeVulnerabilityDto)
  vulnerabilities!: CodeVulnerabilityDto[];

  @IsNumber()
  @Min(0)
  @Max(10)
  mark!: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => VulnCountsDto)
  vulnCounts?: VulnCountsDto;
}
