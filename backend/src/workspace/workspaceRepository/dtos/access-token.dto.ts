import { IsNotEmpty, IsString, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AccessTokenDto {
  @ApiProperty({
    example: 'ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    description: 'GitHub Personal Access Token (classico o fine-grained)',
  })
  @IsNotEmpty({ message: 'Il token di accesso è obbligatorio' })
  @IsString()
  @Matches(/^(ghp_[a-zA-Z0-9]{36}|github_pat_[a-zA-Z0-9_]{82})$/, {
    message:
      'Il token deve essere un Personal Access Token GitHub valido (classico o fine-grained)',
  })
  accessToken!: string;
}
