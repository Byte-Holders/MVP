import { IsString } from 'class-validator';

export class SetErrorStatusDto {
  @IsString()
  token: string;
}
