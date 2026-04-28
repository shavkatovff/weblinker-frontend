import { IsIn, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength, Matches } from "class-validator";

const STATUSES = ["DRAFT", "ACTIVE", "PAUSED", "EXPIRED"] as const;

export class CreateVizitkaDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(64)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, { message: "Faqat kichik harf, raqam va -" })
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  headline?: string;

  @IsOptional()
  @IsString()
  plan?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  category?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  photoUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  contactNumber?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  address?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  workHour?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  shortDescription?: string;

  @IsOptional()
  @IsString()
  @MaxLength(8000)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  templateId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  colorThemeId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  patternId?: string;

  @IsOptional()
  @IsIn([...STATUSES])
  status?: (typeof STATUSES)[number];

  @IsOptional()
  @IsString()
  mapLink?: string;

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
}

export class UpdateVizitkaBodyDto {
  @IsOptional() @IsString() @MaxLength(200) headline?: string;
  @IsOptional() @IsString() @MaxLength(80) category?: string;
  @IsOptional() @IsString() photoUrl?: string;
  @IsOptional() @IsString() contactNumber?: string;
  @IsOptional() @IsString() address?: string;
  @IsOptional() @IsString() workHour?: string;
  @IsOptional() @IsString() shortDescription?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() templateId?: string;
  @IsOptional() @IsString() colorThemeId?: string;
  @IsOptional() @IsString() patternId?: string;
  @IsOptional() @IsIn([...STATUSES]) status?: (typeof STATUSES)[number];
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
}
