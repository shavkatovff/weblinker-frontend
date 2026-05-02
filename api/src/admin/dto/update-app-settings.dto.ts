import { Type } from "class-transformer";
import { IsInt, IsOptional, Max, Min } from "class-validator";

export class UpdateAppSettingsDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(365)
  freePublishDays?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1000)
  @Max(999_999_999)
  paket3Som?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1000)
  @Max(999_999_999)
  paket6Som?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1000)
  @Max(999_999_999)
  paket12Som?: number;
}
