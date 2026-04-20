import { ApiProperty } from '@nestjs/swagger/dist/decorators/api-property.decorator';
import { IsString, MinLength, MaxLength } from 'class-validator';

export class CreateWorkspaceDto {
  @ApiProperty({
    description: 'Nome del workspace',
  })
  @IsString()
  @MinLength(2)
  @MaxLength(30)
  name!: string;

  /*@IsString()
  createdBy!: string*/
}
