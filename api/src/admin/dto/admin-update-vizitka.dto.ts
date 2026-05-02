import {
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateIf,
} from "class-validator";

const STATUSES = ["DRAFT", "ACTIVE", "PAUSED", "EXPIRED"] as const;

/** Admin: egasi tekshiruvsiz yangilash */
export class AdminUpdateVizitkaDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(64)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, { message: "Faqat kichik harf, raqam va -" })
  name?: string;

  @IsOptional() @IsString() @MaxLength(200) headline?: string;
  @IsOptional() @IsString() @MaxLength(80) category?: string;
  @IsOptional() @IsString() @MaxLength(2048) photoUrl?: string;
  @IsOptional() @IsString() @MaxLength(2048) logoUrl?: string;
  @IsOptional() @IsString() contactNumber?: string;
  @IsOptional() @IsString() address?: string;
  @IsOptional() @IsString() workHour?: string;
  @IsOptional() @IsString() shortDescription?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() templateId?: string;
  @IsOptional() @IsString() colorThemeId?: string;
  @IsOptional() @IsString() patternId?: string;
  @IsOptional() @IsIn([...STATUSES]) status?: (typeof STATUSES)[number];
  @IsOptional() @IsString() plan?: string;
  @IsOptional() @IsString() mapLink?: string;
  @IsOptional() @IsString() instagramLink?: string;
  @IsOptional() @IsString() telegramLink?: string;
  @IsOptional() @IsString() tiktokLink?: string;
  @IsOptional() @IsString() youtubeLink?: string;
  @IsOptional() @IsString() facebookLink?: string;
  @IsOptional() @IsString() linkedinLink?: string;
  @IsOptional() @IsString() xLink?: string;
  @IsOptional() @IsString() threadsLink?: string;
  @IsOptional() @IsString() whatsappLink?: string;
  @IsOptional() @IsString() websaytLink?: string;

  /** Joriy tugash sanasidan (yoki hozirdan) shuncha kun qo‘shiladi */
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(3650)
  extendByDays?: number;

  /** Obuna tugashi (ISO 8601). `null` — cheksiz / sanasiz */
  @IsOptional()
  @ValidateIf((_, v) => v !== null)
  @IsDateString()
  expiredAt?: string | null;
}
