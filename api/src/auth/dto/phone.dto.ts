import { IsString, MinLength } from "class-validator";

export class PhoneDto {
  @IsString()
  @MinLength(5)
  phone!: string;
}
