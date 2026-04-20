import { ApiProperty } from '@nestjs/swagger/dist/decorators/api-property.decorator';
import { IsString } from 'class-validator';

export class WorkspaceResponseDto {
  @ApiProperty({
    description: 'ID del workspace',
  })
  @IsString()
  id!: string;
  @ApiProperty({
    description: 'Nome del workspace',
  })
  @IsString()
  name!: string;
  @ApiProperty({
    description: 'Username del creatore del workspace',
  })
  @IsString()
  owner!: string; // username, non userId
  @ApiProperty({
    description: 'Ruolo del requester (Project Manager, Tech Lead, Developer)',
  })
  @IsString()
  role!: string; // ruolo del requester
}
