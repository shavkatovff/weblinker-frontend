import { IsIn } from "class-validator";

export class ChargeLandingSubscriptionDto {
  @IsIn([6, 12])
  months!: 6 | 12;
}
