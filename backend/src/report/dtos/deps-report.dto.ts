import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { VulnCountsDto } from './vuln-counts.dto';

export class DependencyDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  version!: string;
}

export class DepVulnerabilityDto {
  @IsString()
  @IsNotEmpty()
  id!: string;

  @IsString()
  @IsNotEmpty()
  severity!: string;

  @IsString()
  @IsNotEmpty()
  packageName!: string;

  @IsString()
  @IsNotEmpty()
  packageVersion!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  fixVersion?: string;
}

export class DepsReportDto {
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DependencyDto)
  list?: DependencyDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DepVulnerabilityDto)
  vulnerabilities!: DepVulnerabilityDto[];

  @IsString()
  vulnerabilityAnalysis!: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => VulnCountsDto)
  vulnCounts?: VulnCountsDto;
}
