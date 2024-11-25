import {
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsString,
  IsBoolean,
  IsOptional,
} from 'class-validator';

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

  @IsNumber()
  @IsOptional()
  tp1?: number;

  @IsNumber()
  @IsOptional()
  sl1?: number;

  @IsNumber()
  @IsOptional()
  tp2?: number;

  @IsNumber()
  @IsOptional()
  sl2?: number;
}

export class CreateAlertDto {
  @IsNotEmpty()
  @IsString()
  tf: string;

  @IsNotEmpty()
  @IsString()
  alert: string;

  @IsNotEmpty()
  @IsObject()
  ohlcv: OhlcvDto;

  @IsNotEmpty()
  @IsString()
  ticker: string;

  @IsNotEmpty()
  @IsNumber()
  bartime: number;

  @IsOptional()
  @IsBoolean()
  isStocksAlert?: boolean;

  @IsOptional()
  @IsBoolean()
  isForexAlert?: boolean;
}
