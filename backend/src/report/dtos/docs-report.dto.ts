import { IsNotEmpty, IsNumber, IsString, Max, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DocsReportDto {
  @ApiProperty({
    description: 'Analisi testuale del file README',
    example: 'Il README è ben strutturato e include istruzioni di installazione, esempi di utilizzo e una descrizione chiara del progetto.',
  })
  @IsString()
  @IsNotEmpty()
  readmeReport!: string;

  @ApiProperty({
    description: 'Analisi della qualità e copertura dei commenti nel codice',
    example: 'Il 42% delle funzioni pubbliche è commentato. I commenti presenti sono descrittivi ma mancano JSDoc sulle API esposte.',
  })
  @IsString()
  @IsNotEmpty()
  commentReport!: string;

  @ApiProperty({ description: 'Voto della documentazione (0–10)', minimum: 0, maximum: 10, example: 6.5 })
  @IsNumber()
  @Min(0)
  @Max(10)
  mark!: number;
}
