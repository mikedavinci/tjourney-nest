import { ApiProperty } from '@nestjs/swagger';

export class SymbolDataDto {
  symbol: string;

  instrument_name: string;

  exchange: string;

  mic_code: string;

  exchange_timezone: string;

  logo: string;

  instrument_type: string;

  country: string;

  currency: string;
}

export class SymbolSearchResponseDto {
  @ApiProperty({ type: [SymbolDataDto] })
  data: SymbolDataDto[];

  status: string;
}
