import { IsNotEmpty, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { DepsReportDto } from './deps-report.dto';
import { VulnerabilitiesReportDto } from './vulnerabilities-report.dto';
import { DocsReportDto } from './docs-report.dto';
import { TestReportDto } from './test-report.dto';
import { TechReportDto } from './tech-report.dto';

export class ReportDataDto {
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => DepsReportDto)
  depsReport!: DepsReportDto;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => VulnerabilitiesReportDto)
  vulnerabilitiesReport!: VulnerabilitiesReportDto;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => DocsReportDto)
  docsReport!: DocsReportDto;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => TestReportDto)
  testReport!: TestReportDto;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => TechReportDto)
  techReport!: TechReportDto;
}
