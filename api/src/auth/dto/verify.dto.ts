import { IsString, Length, Matches, MinLength } from "class-validator";

export class VerifyDto {
  @IsString()
  @MinLength(5)
  phone!: string;

  @IsString()
  @Length(6, 6)
  @Matches(/^\d{6}$/)
  code!: string;
}
