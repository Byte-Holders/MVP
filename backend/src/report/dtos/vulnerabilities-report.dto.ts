import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CodeVulnerabilityDto {
  @IsString()
  @IsNotEmpty()
  id!: string;

  @IsString()
  @IsNotEmpty()
  path!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsString()
  @IsNotEmpty()
  remediation!: string;

  @IsNumber()
  @Min(0)
  @Max(10)
  severity!: number;

  @IsString()
  @IsNotEmpty()
  impact!: string;

  @IsString()
  @IsNotEmpty()
  category!: string;

  @IsArray()
  @IsString({ each: true })
  cwe!: string[];

  @IsArray()
  @IsString({ each: true })
  owasp!: string[];
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
}
