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
  @ApiPropertyOptional({ description: 'Owner del repository (utente o organizzazione GitHub)' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  owner?: string;

  @ApiPropertyOptional({ description: 'ID interno del repository' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  repositoryId?: string;

  @ApiProperty({ description: 'Branch analizzato' })
  @IsString()
  @IsNotEmpty()
  branch!: string;
}

export class ReportMetadataDto {
  @ApiProperty({ description: 'Timestamp di avvio della scansione (ISO 8601)' })
  @IsDateString()
  startScanTime!: string;

  @ApiProperty({ description: 'Timestamp di fine della scansione (ISO 8601)' })
  @IsDateString()
  endScanTime!: string;

  @ApiProperty({ description: 'Target della scansione', type: () => ReportTargetDto })
  @IsDefined()
  @ValidateNested()
  @Type(() => ReportTargetDto)
  target!: ReportTargetDto;
}
