import { IsString } from 'class-validator';
import { WorkspaceResponseDto } from './WorkspaceResponseDto';
import { ApiProperty } from '@nestjs/swagger/dist/decorators/api-property.decorator';

export class WorkspaceListResponseDto {
  @ApiProperty({
    description: "Lista dei workspace dell'utente",
  })
  @IsString()
  workspaces!: WorkspaceResponseDto[];
  @ApiProperty({
    description: "Numero totale di workspace dell'utente",
  })
  total!: number;
}
