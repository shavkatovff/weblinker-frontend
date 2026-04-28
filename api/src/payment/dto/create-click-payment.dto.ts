import { IsInt, Max, Min } from 'class-validator';

/** Summa butun so'mda (masalan 50_000). Server tiyinga o'tkazadi (×100). */
export class CreateClickPaymentDto {
  @IsInt()
  @Min(1000, { message: 'Kamida 1000 so‘m' })
  @Max(100_000_000, { message: 'Summa juda katta' })
  amount!: number;
}
