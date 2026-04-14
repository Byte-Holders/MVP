import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class TechEntryDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  version!: string;
}

export class LanguageDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsNumber()
  @Min(0)
  value!: number;
}

export class TechReportDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TechEntryDto)
  libraries!: TechEntryDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TechEntryDto)
  frameworks!: TechEntryDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LanguageDto)
  languages!: LanguageDto[];
}
