// twelve-data-time-series.dto.ts

export class TimeSeriesValueDto {
  datetime: string;
  open: string;
  high: string;
  low: string;
  close: string;
}

export class TwelveDataTimeSeriesDto {
  meta: {
    symbol: string;
    interval: string;
    currency_base: string;
    currency_quote: string;
    type: string;
  };
  values: TimeSeriesValueDto[];
  status: string;
}
