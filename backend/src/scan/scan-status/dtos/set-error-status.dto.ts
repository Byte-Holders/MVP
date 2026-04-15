import { IsNotEmpty, IsString } from 'class-validator';

export class SetErrorStatusDto {
  @IsString()
  @IsNotEmpty()
  token: string;
}
