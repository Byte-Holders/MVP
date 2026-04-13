import { IsNumber, IsString, Max, Min } from 'class-validator';

export class DocsReportDto {
  @IsString()
  readmeReport!: string;

  @IsString()
  commentReport!: string;

  @IsNumber()
  @Min(0)
  @Max(10)
  mark!: number;
}
