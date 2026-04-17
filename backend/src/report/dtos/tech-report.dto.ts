import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class TechEntryDto {
  @ApiProperty({ description: 'Nome della libreria o framework' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ description: 'Versione rilevata' })
  @IsString()
  @IsNotEmpty()
  version!: string;
}

export class LanguageDto {
  @ApiProperty({ description: 'Nome del linguaggio di programmazione' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({
    description: 'Percentuale di utilizzo nel repository (0–100)',
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  value!: number;
}

export class TechReportDto {
  @ApiProperty({
    description: 'Librerie rilevate nel progetto',
    type: [TechEntryDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TechEntryDto)
  libraries!: TechEntryDto[];

  @ApiProperty({
    description: 'Framework rilevati nel progetto',
    type: [TechEntryDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TechEntryDto)
  frameworks!: TechEntryDto[];

  @ApiProperty({
    description:
      'Linguaggi di programmazione rilevati con percentuale di utilizzo',
    type: [LanguageDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LanguageDto)
  languages!: LanguageDto[];
}
