import { IsNotEmpty, IsOptional, IsString, IsUrl, Matches } from 'class-validator';

export class AddRepositoryDto {
  @IsNotEmpty({ message: "L'URL del repository è obbligatorio" })
  @IsString()
  @IsUrl({}, { message: 'Deve essere un URL valido' })
  repositoryUrl!: string;

  @IsOptional()
  @IsString()
  @Matches(/^(ghp_[a-zA-Z0-9]{36}|github_pat_[a-zA-Z0-9_]{82})$/, {
    message: 'Il token deve essere un Personal Access Token GitHub valido (classico o fine-grained)',
  })
  accessToken?: string;
}
