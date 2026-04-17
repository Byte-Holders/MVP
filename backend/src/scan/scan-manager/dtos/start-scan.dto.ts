import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class StartScanDto {
  @ApiProperty({ description: 'ID del repository da scansionare' })
  @IsString()
  @IsNotEmpty()
  repositoryId: string;

  @ApiProperty({ description: 'ID del workspace' })
  @IsString()
  @IsNotEmpty()
  workspaceId: string;

  @ApiProperty({
    example: 'develop',
    description: 'Nome del branch da scansionare',
  })
  @IsString()
  @IsNotEmpty()
  branch: string;
}
