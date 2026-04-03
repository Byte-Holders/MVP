import { IsMongoId, IsNotEmpty } from 'class-validator';

export class WorkspaceParamsDto {
  @IsNotEmpty()
  @IsMongoId({ message: 'Il parametro workspaceId deve essere un Object ID di MongoDB valido' })
  workspaceId: string;
}
