// DTO
import {
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class OhlcvDto {
  @IsNumber()
  open: number;

  @IsNumber()
  high: number;

  @IsNumber()
  low: number;

  @IsNumber()
  close: number;

  @IsNumber()
  volume: number;
}

class AlertDataDto {
  @IsString()
  alert: string;

  @IsString()
  ticker: string;

  @IsString()
  tf: string;

  @IsObject()
  @ValidateNested()
  @Type(() => OhlcvDto)
  ohlcv: OhlcvDto;

  @IsNumber()
  bartime: number;
}

export class CreateAlertDto {
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => AlertDataDto)
  alertData: AlertDataDto;
}
