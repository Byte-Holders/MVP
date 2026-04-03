import { IsMongoId, IsNotEmpty } from 'class-validator';

export class WorkspaceRepoParamsDto {
  @IsNotEmpty()
  @IsMongoId({ message: 'Il parametro workspaceId deve essere un Object ID di MongoDB valido' })
  workspaceId: string;

  @IsNotEmpty()
  @IsMongoId({ message: 'Il parametro repoId deve essere un Object ID di MongoDB valido' })
  repoId: string;
}
