import { IsNotEmpty, IsNumber, IsString, Max, Min } from 'class-validator';

export class DocsReportDto {
  @IsString()
  @IsNotEmpty()
  readmeReport!: string;

  @IsString()
  @IsNotEmpty()
  commentReport!: string;

  @IsNumber()
  @Min(0)
  @Max(10)
  mark!: number;
}
