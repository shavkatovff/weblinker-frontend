import {
  IsIn,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from "class-validator";

export class UpsertLandingDto {
  /** Birinchi nashrdan keyin qayta yozish */
  @IsOptional()
  @IsString()
  publicationId?: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(64)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, { message: "Faqat kichik harf, raqam va -" })
  slug!: string;

  @IsString()
  @IsIn(["default", "simple"])
  templateId!: "default" | "simple";

  @IsString()
  @IsIn(["draft", "published", "paused"])
  status!: "draft" | "published" | "paused";

  /** Frontend `LandingContent` JSON */
  @IsObject()
  content!: Record<string, unknown>;
}
