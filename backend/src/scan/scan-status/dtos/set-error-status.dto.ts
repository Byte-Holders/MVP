import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SetErrorStatusDto {
  @ApiProperty({ description: 'Token JWT di callback emesso dal container' })
  @IsString()
  @IsNotEmpty()
  token: string;
}
