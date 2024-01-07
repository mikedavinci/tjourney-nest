import { Controller, Get, Query } from '@nestjs/common';
import { CoinmarketcapService } from './coinmarketcap.service';

@Controller('coinmarketcap')
export class CoinmarketcapController {
  constructor(private readonly coinmarketcapService: CoinmarketcapService) {}

  @Get('latest-global-metrics')
  async getLatestGlobalMetrics() {
    return await this.coinmarketcapService.getLatestGlobalMetrics();
  }

  @Get('/info')
  async getCryptoInfo(@Query('ids') ids: string): Promise<any> {
    const idArray = ids ? ids.split(',') : [];
    return this.coinmarketcapService.getCryptoInfo(idArray);
  }

  @Get('listings-latest')
  async getLatestListings(
    @Query('start') start: number,
    @Query('limit') limit: number,
    @Query('sort') sort: string,
    // @Query('cryptocurrency_type') cryptocurrencyType: string,
    // @Query('tag') tag: string,
  ) {
    return await this.coinmarketcapService.getLatestListings({
      start,
      limit,
      sort,
      // cryptocurrencyType,
      // tag,
    });
  }
  @Get('ohlcvHistorical')
  async getOhlcvHistorical(
    @Query('symbol') symbol: string,
    @Query('time_start') time_start: string,
    @Query('time_end') time_end: string,
    @Query('count') count: number,
  ) {
    return await this.coinmarketcapService.getOhlcvHistorical({
      symbol,
      time_start,
      time_end,
      count,
    });
  }
}
