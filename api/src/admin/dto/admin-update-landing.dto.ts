import {
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateIf,
} from 'class-validator';

/** Admin: landing obunasi va manzili */
export class AdminUpdateLandingDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(64)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'Faqat kichik harf, raqam va -',
  })
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  plan?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(3650)
  extendByDays?: number;

  @IsOptional()
  @ValidateIf((_, v) => v !== null)
  @IsDateString()
  expiredAt?: string | null;
}
