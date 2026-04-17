import {
  IsArray,
  IsDefined,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CoverageReportDto {
  @ApiProperty({ description: 'Percentuale di copertura degli statement (0–100)', minimum: 0, maximum: 100, example: 82.5 })
  @IsNumber()
  @Min(0)
  @Max(100)
  statements!: number;

  @ApiProperty({ description: 'Percentuale di copertura dei branch (0–100)', minimum: 0, maximum: 100, example: 74.1 })
  @IsNumber()
  @Min(0)
  @Max(100)
  branches!: number;

  @ApiProperty({ description: 'Percentuale di copertura delle funzioni (0–100)', minimum: 0, maximum: 100, example: 90.0 })
  @IsNumber()
  @Min(0)
  @Max(100)
  functions!: number;

  @ApiProperty({ description: 'Percentuale di copertura delle righe (0–100)', minimum: 0, maximum: 100, example: 83.7 })
  @IsNumber()
  @Min(0)
  @Max(100)
  lines!: number;
}

export class FailedTestDto {
  @ApiProperty({ description: 'Nome del test fallito', example: 'should return 401 when token is expired' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ description: 'Percorso del file contenente il test', example: 'src/auth/auth.service.spec.ts' })
  @IsString()
  @IsNotEmpty()
  path!: string;

  @ApiProperty({
    description: 'Messaggio di errore sintetico del test',
    example: 'Expected status 401 but received 500: Cannot read properties of undefined',
  })
  @IsString()
  @IsNotEmpty()
  messageSummary!: string;
}

export class TestReportDto {
  @ApiProperty({ description: 'Dati di copertura del codice', type: () => CoverageReportDto })
  @IsDefined()
  @ValidateNested()
  @Type(() => CoverageReportDto)
  coverageReport!: CoverageReportDto;

  @ApiProperty({ description: 'Lista dei test falliti', type: [FailedTestDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FailedTestDto)
  failedTests!: FailedTestDto[];

  @ApiProperty({ description: 'Numero totale di test eseguiti', minimum: 0, example: 148 })
  @IsInt()
  @Min(0)
  testsRun!: number;
}
