export class MT4SignalResponseDto {
  ticker: string;
  action: 'BUY' | 'SELL' | 'NEUTRAL';
  price: number;
  stopLoss?: number;
  takeProfit?: number;
  sl1?: number;
  tp1?: number;
  sl2?: number;
  tp2?: number;
  timestamp: string;
  signalPattern: string;
  ohlcv: {
    low: number;
    high: number;
    open: number;
    close: number;
    volume: number;
  };
  timeframe: string;
  isExit: boolean;
  exitType: 'bullish' | 'bearish' | null;
}
