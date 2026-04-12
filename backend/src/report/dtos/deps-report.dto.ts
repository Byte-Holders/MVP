import { IsArray, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

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
}

export class DepsReportDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DependencyDto)
  list!: DependencyDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DepVulnerabilityDto)
  vulnerabilities!: DepVulnerabilityDto[];

  @IsString()
  @IsNotEmpty()
  vulnerabilityAnalysis!: string;
}
