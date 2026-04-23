import { IsNotEmpty, IsNumber, IsString, Max, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ReportSummaryDto {
  @ApiProperty({
    description: 'Testo del riepilogo generato dal modello AI',
    example:
      'Il progetto presenta una buona copertura dei test e una struttura modulare. Sono state rilevate alcune vulnerabilità nelle dipendenze che richiedono attenzione.',
  })
  @IsString()
  @IsNotEmpty()
  summary!: string;

  @ApiProperty({
    description: 'Voto complessivo del report (0–10)',
    minimum: 0,
    maximum: 10,
    example: 7.4,
  })
  @IsNumber()
  @Min(0)
  @Max(10)
  mark!: number;
}
