import {
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';

export class AddRepositoryDto {
  @IsNotEmpty({ message: "L'URL del repository è obbligatorio" })
  @IsString()
  @IsUrl({}, { message: 'Deve essere un URL valido' })
  repositoryUrl!: string;

  @IsOptional()
  @IsString({ message: 'accessToken deve essere una stringa' })
  accessToken?: string;

  @IsNotEmpty()
  @IsMongoId({
    message: 'workspaceId deve essere un Object ID di MongoDB valido',
  })
  workspaceId!: string;
}
