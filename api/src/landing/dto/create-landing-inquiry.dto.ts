import { IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class CreateLandingInquiryDto {
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  visitorName!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(40)
  visitorPhone!: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  visitorTelegram?: string;

  @IsString()
  @MinLength(1)
  @MaxLength(4000)
  message!: string;
}
