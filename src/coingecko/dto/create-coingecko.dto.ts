// Response DTO
export class CoinGeckoSearchResponseDto {
  id: string;
  name: string;
  api_symbol: string;
  symbol: string;
  market_cap_rank: number;
  thumb: string;
  large: string;
}

export class CoinGeckoSearchDto {
  coins: CoinGeckoSearchResponseDto[];
}
