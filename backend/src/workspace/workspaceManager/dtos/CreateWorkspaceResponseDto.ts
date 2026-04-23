import { ApiProperty } from '@nestjs/swagger/dist/decorators/api-property.decorator';
import { IsString } from 'class-validator';

export class CreateWorkspaceResponseDto {
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
  ownerUsername!: string;
}
