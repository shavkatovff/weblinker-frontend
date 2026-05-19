import { IsIn } from 'class-validator';

export class ExtendLandingSubscriptionDto {
  @IsIn([6, 12])
  months!: 6 | 12;
}
