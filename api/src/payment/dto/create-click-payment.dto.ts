import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

/** Summa butun so'mda (masalan 50_000). Server tiyinga o'tkazadi (×100). */
export class CreateClickPaymentDto {
  @IsInt()
  @Min(1000, { message: 'Kamida 1000 so‘m' })
  @Max(100_000_000, { message: 'Summa juda katta' })
  amount!: number;

  /** Vizitka muddatini uzaytirish — `subscriptionMonths` bilan birga */
  @IsOptional()
  @IsString()
  vizitkaId?: string;

  @IsOptional()
  @IsIn([6, 12])
  subscriptionMonths?: 6 | 12;
}
