import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';

export class RepositoryResponseDto {
  @IsNotEmpty()
  @IsMongoId({
    message: 'repositoryId deve essere un Object ID di MongoDB valido',
  })
  repositoryId!: string;

  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsNotEmpty()
  @IsString()
  ownerName!: string;
}
