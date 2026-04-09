import { IsISO8601, IsNotEmpty } from 'class-validator';

export class GetAvailableSlotsDto {
  @IsISO8601()
  @IsNotEmpty()
  forDate!: string;
}
