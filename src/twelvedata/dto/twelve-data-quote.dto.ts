export interface TwelveDataQuoteDto {
  id: string;
  symbol: string;
  name?: string;
  exchange?: string;
  datetime?: string;
  timestamp?: number;
  open?: number;
  high?: number;
  low?: number;
  close?: number;
  previous_close?: number;
  change?: number;
  percent_change?: number;
  is_market_open?: boolean;
  fifty_two_week?: {
    low?: number;
    high?: number;
    low_change?: number;
    high_change?: number;
    low_change_percent?: number;
    high_change_percent?: number;
    range?: string;
  };
  updatedDate?: Date;
}
