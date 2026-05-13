import {
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

/**
 * Yangi landing yaratish — `name` majburiy, qolganlari ixtiyoriy.
 * Mijoz bir martada tahrirlangan kontentni ham, manzilni ham yuborishi mumkin.
 */
export class CreateLandingDto {
  /** weblinker.uz/{name} */
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(64)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'Faqat kichik harf, raqam va `-`',
  })
  name!: string;

  @IsOptional() @IsString() @MaxLength(120) category?: string;

  @IsOptional() @IsBoolean() blockHeader?: boolean;
  @IsOptional() @IsBoolean() blockHero?: boolean;
  @IsOptional() @IsBoolean() blockAbout?: boolean;
  @IsOptional() @IsBoolean() blockFaq?: boolean;
  @IsOptional() @IsBoolean() blockContact?: boolean;
  @IsOptional() @IsBoolean() blockFooter?: boolean;

  @IsOptional()
  @IsString()
  @IsIn(['1', '2', '3', '4'])
  blocktheme?: string;

  @IsOptional() @IsString() @MaxLength(120) brandName?: string;
  @IsOptional() @IsString() @MaxLength(4000) logourl?: string;
  @IsOptional() @IsString() @MaxLength(60) navAbout?: string;
  @IsOptional() @IsString() @MaxLength(60) navFaq?: string;
  @IsOptional() @IsString() @MaxLength(60) navContact?: string;
  @IsOptional() @IsString() @MaxLength(60) navCta?: string;

  @IsOptional() @IsString() @MaxLength(400) heroTitle?: string;
  @IsOptional() @IsString() @MaxLength(4000) description?: string;
  @IsOptional() @IsString() @MaxLength(60) heroCta?: string;
  @IsOptional() @IsString() heroImageUrl?: string;

  @IsOptional() @IsString() @MaxLength(200) aboutTitle?: string;
  @IsOptional() @IsString() @MaxLength(2000) aboutLead?: string;
  @IsOptional() @IsString() aboutImageUrl?: string;
  @IsOptional() @IsString() @MaxLength(200) aboutBullet1?: string;
  @IsOptional() @IsString() @MaxLength(200) aboutBullet2?: string;
  @IsOptional() @IsString() @MaxLength(200) aboutBullet3?: string;
  @IsOptional() @IsString() @MaxLength(200) aboutBullet4?: string;

  @IsOptional() @IsString() @MaxLength(200) faq1Q?: string;
  @IsOptional() @IsString() @MaxLength(2000) faq1A?: string;
  @IsOptional() @IsString() @MaxLength(200) faq2Q?: string;
  @IsOptional() @IsString() @MaxLength(2000) faq2A?: string;
  @IsOptional() @IsString() @MaxLength(200) faq3Q?: string;
  @IsOptional() @IsString() @MaxLength(2000) faq3A?: string;
  @IsOptional() @IsString() @MaxLength(200) faq4Q?: string;
  @IsOptional() @IsString() @MaxLength(2000) faq4A?: string;

  @IsOptional() @IsString() @MaxLength(2000) contactSubtitle?: string;
  @IsOptional() @IsString() @MaxLength(200) address?: string;
  @IsOptional() @IsString() @MaxLength(60) phoneTel?: string;
  @IsOptional() @IsString() @MaxLength(80) telegram?: string;
  @IsOptional() @IsString() @MaxLength(120) hours?: string;

  @IsOptional() @IsString() @MaxLength(200) footerCopyrightSuffix?: string;
}
