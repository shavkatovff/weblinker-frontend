import { IsIn } from 'class-validator';

export class ExtendVizitkaSubscriptionDto {
  @IsIn([6, 12])
  months!: 6 | 12;
}
