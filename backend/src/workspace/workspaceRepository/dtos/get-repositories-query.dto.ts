import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetRepositoriesQueryDto {
  @ApiPropertyOptional({ description: 'Testo per filtrare i repository per nome', example: 'my-repo' })
  @IsOptional()
  @IsString()
  searchInput?: string;
}
