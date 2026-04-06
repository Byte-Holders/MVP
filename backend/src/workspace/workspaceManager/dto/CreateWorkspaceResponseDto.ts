import { IsString} from 'class-validator'

export class CreateWorkspaceResponseDto {
  @IsString()
  id!: string

  @IsString()
  name!: string

  @IsString()
  createdBy!: string
}