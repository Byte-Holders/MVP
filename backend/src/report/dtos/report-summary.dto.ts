import { IsNotEmpty, IsNumber, IsString, Max, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ReportSummaryDto {
  @ApiProperty({ description: 'Testo del riepilogo generato dal modello AI' })
  @IsString()
  @IsNotEmpty()
  summary!: string;

  @ApiProperty({ description: 'Voto complessivo del report (0–10)', minimum: 0, maximum: 10 })
  @IsNumber()
  @Min(0)
  @Max(10)
  mark!: number;
}
