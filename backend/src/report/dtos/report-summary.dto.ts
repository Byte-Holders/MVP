import { IsNotEmpty, IsNumber, IsString, Max, Min } from 'class-validator';

export class ReportSummaryDto {
  @IsString()
  @IsNotEmpty()
  summary!: string;

  @IsNumber()
  @Min(0)
  @Max(10)
  mark!: number;
}
