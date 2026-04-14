import { IsNumber, Min } from 'class-validator';

export class VulnCountsDto {
  @IsNumber()
  @Min(0)
  critical!: number;

  @IsNumber()
  @Min(0)
  high!: number;

  @IsNumber()
  @Min(0)
  medium!: number;

  @IsNumber()
  @Min(0)
  low!: number;
}
