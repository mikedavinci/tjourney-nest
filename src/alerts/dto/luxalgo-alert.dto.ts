import {
  IsNotEmpty,
  IsObject,
  IsString,
  IsNumber,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LuxAlgoAlertDto {
  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'EURUSD', required: false })
  ticker?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: '240', required: false })
  tf?: string;

  @IsOptional()
  @IsNumber()
  @ApiProperty({ example: 1703448000000, required: false })
  bartime?: number;

  @IsOptional()
  @ApiProperty({
    description: 'Raw alert data from TradingView/LuxAlgo',
    required: false,
    example: {
      alert: 'Bullish Confirmation',
      ticker: 'EURUSD',
      tf: '240',
      ohlcv: {
        open: 1.048,
        high: 1.0501,
        low: 1.0461,
        close: 1.0478,
        volume: 36385,
      },
    },
  })
  alert_data?: any;
}
