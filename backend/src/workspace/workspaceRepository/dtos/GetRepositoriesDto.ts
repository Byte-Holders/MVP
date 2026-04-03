import { IsMongoId, IsNotEmpty } from 'class-validator';

export class GetRepositoriesDto {
  @IsNotEmpty()
  @IsMongoId({
    message: 'workspaceId deve essere un Object ID di MongoDB valido',
  })
  workspaceId: string;
}
