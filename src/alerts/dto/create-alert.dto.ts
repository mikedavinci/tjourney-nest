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

export class CreateAlertDto {
  @IsNotEmpty()
  @IsString()
  alert: string;

  @IsNotEmpty()
  @IsString()
  ticker: string;

  @IsNotEmpty()
  @IsString()
  tf: string;

  @IsNotEmpty()
  @IsObject()
  @ValidateNested()
  @Type(() => OhlcvDto)
  ohlcv: OhlcvDto;

  @IsNotEmpty()
  @IsNumber()
  bartime: number;
}
