import { IsString} from 'class-validator'

export class WorkspaceResponseDto {
    @IsString()
    id!: string;
    @IsString()
    name!: string;
    @IsString()
    owner!: string;        // username, non userId
 /* creationDate: Date;
  memberCount: number;*/
}