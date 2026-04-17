import {
  IsDefined,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ReportTargetDto {
  @ApiPropertyOptional({ description: 'Owner del repository (utente o organizzazione GitHub)', example: 'octocat' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  owner?: string;

  @ApiPropertyOptional({ description: 'ID interno del repository', example: '64f1a2b3c4d5e6f7a8b9c0d1' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  repositoryId?: string;

  @ApiProperty({ description: 'Branch analizzato', example: 'main' })
  @IsString()
  @IsNotEmpty()
  branch!: string;
}

export class ReportMetadataDto {
  @ApiProperty({ description: 'Timestamp di avvio della scansione (ISO 8601)', example: '2025-04-17T10:00:00.000Z' })
  @IsDateString()
  startScanTime!: string;

  @ApiProperty({ description: 'Timestamp di fine della scansione (ISO 8601)', example: '2025-04-17T10:04:32.000Z' })
  @IsDateString()
  endScanTime!: string;

  @ApiProperty({
    description: 'Target della scansione',
    type: () => ReportTargetDto,
  })
  @IsDefined()
  @ValidateNested()
  @Type(() => ReportTargetDto)
  target!: ReportTargetDto;
}
