import { IsString, MinLength, MaxLength } from 'class-validator'

export class CreateWorkspaceDto {
  @IsString()
  @MinLength(2)
  @MaxLength(30)  
  name!: string 

  @IsString()
  createdBy!: string
}