import { IsNotEmpty, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { DepsReportDto } from './deps-report.dto';
import { VulnerabilitiesReportDto } from './vulnerabilities-report.dto';
import { DocsReportDto } from './docs-report.dto';
import { TestReportDto } from './test-report.dto';
import { TechReportDto } from './tech-report.dto';

export class ReportDataDto {
  @ApiProperty({
    description: 'Report sulle dipendenze e relative vulnerabilità',
    type: () => DepsReportDto,
  })
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => DepsReportDto)
  depsReport!: DepsReportDto;

  @ApiProperty({
    description: 'Report sulle vulnerabilità nel codice sorgente',
    type: () => VulnerabilitiesReportDto,
  })
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => VulnerabilitiesReportDto)
  vulnerabilitiesReport!: VulnerabilitiesReportDto;

  @ApiProperty({
    description: 'Report sulla documentazione del progetto',
    type: () => DocsReportDto,
  })
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => DocsReportDto)
  docsReport!: DocsReportDto;

  @ApiProperty({
    description: "Report sull'esecuzione dei test",
    type: () => TestReportDto,
  })
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => TestReportDto)
  testReport!: TestReportDto;

  @ApiProperty({
    description: 'Report sulle tecnologie rilevate nel progetto',
    type: () => TechReportDto,
  })
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => TechReportDto)
  techReport!: TechReportDto;
}
