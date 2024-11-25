import { IsNotEmpty, IsObject, IsString, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LuxAlgoAlertDto {
  @IsNotEmpty()
  @IsObject()
  @ApiProperty({
    description: 'Complete alert data from LuxAlgo',
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
      bartime: 1703448000000,
      tp1: 1.055,
      sl1: 1.04,
      tp2: 1.06,
      sl2: 1.035,
      // Additional specific fields can be included here
    },
  })
  alert_data: any;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'EURUSD' })
  ticker: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: '240' })
  tf: string;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({ example: 1703448000000 })
  bartime: number;
}
