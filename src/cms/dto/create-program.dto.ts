import {
  IsDateString,
  IsInt,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateProgramDto {
  @IsString()
  @MaxLength(512)
  title: string;

  // Free-form text description.
  @IsString()
  description: string;

  // A short category label.
  @IsString()
  @MaxLength(256)
  category: string;

  // Language code/name.
  @IsString()
  @MaxLength(32)
  language: string;

  @IsInt()
  @Min(0)
  duration: number;

  // Accepts ISO date strings (e.g. "2026-03-27").
  @IsDateString()
  publishDate: string;
}
