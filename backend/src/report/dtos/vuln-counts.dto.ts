import { IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VulnCountsDto {
  @ApiProperty({
    description: 'Numero di vulnerabilità critiche',
    minimum: 0,
    example: 2,
  })
  @IsNumber()
  @Min(0)
  critical!: number;

  @ApiProperty({
    description: 'Numero di vulnerabilità alte',
    minimum: 0,
    example: 5,
  })
  @IsNumber()
  @Min(0)
  high!: number;

  @ApiProperty({
    description: 'Numero di vulnerabilità medie',
    minimum: 0,
    example: 12,
  })
  @IsNumber()
  @Min(0)
  medium!: number;

  @ApiProperty({
    description: 'Numero di vulnerabilità basse',
    minimum: 0,
    example: 8,
  })
  @IsNumber()
  @Min(0)
  low!: number;
}
