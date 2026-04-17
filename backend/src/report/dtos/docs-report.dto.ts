import { IsNotEmpty, IsNumber, IsString, Max, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DocsReportDto {
  @ApiProperty({ description: 'Analisi testuale del file README' })
  @IsString()
  @IsNotEmpty()
  readmeReport!: string;

  @ApiProperty({
    description: 'Analisi della qualità e copertura dei commenti nel codice',
  })
  @IsString()
  @IsNotEmpty()
  commentReport!: string;

  @ApiProperty({
    description: 'Voto della documentazione (0–10)',
    minimum: 0,
    maximum: 10,
  })
  @IsNumber()
  @Min(0)
  @Max(10)
  mark!: number;
}
