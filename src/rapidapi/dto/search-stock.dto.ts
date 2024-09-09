export class StockSearchResponseDto {
  exchange: string;
  ticker: string;
  security_name: string;
  is_etf?: string;
  last_updated: string;
  search_type: string;
  similarity_score: number;
}
