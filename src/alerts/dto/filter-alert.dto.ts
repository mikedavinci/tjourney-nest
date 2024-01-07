// src/alert/dto/filter-alert.dto.ts

import { IsString, IsIn } from 'class-validator';

export class FilterAlertDto {
  @IsString()
  @IsIn(['Bullish', 'Bearish'])
  bullOrBear!: string;

  @IsString()
  tf!: string;
}
