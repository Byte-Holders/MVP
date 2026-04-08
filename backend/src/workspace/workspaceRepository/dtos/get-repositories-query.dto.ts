import { IsOptional, IsString } from 'class-validator';

export class GetRepositoriesQueryDto {
  @IsOptional()
  @IsString()
  searchInput?: string;
}
