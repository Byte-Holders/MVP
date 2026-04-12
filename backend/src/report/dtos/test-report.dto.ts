import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CoverageReportDto {
  @IsNumber()
  @Min(0)
  @Max(100)
  statements!: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  branches!: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  functions!: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  lines!: number;
}

export class FailedTestDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  path!: string;

  @IsString()
  @IsNotEmpty()
  messageSummary!: string;
}

export class TestReportDto {
  @ValidateNested()
  @Type(() => CoverageReportDto)
  coverageReport!: CoverageReportDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FailedTestDto)
  failedTests!: FailedTestDto[];

  @IsInt()
  @Min(0)
  testsRun!: number;
}
