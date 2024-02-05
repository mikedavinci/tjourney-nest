import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { CoinmarketcapService } from './coinmarketcap.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags('Coinmarketcap')
@UseGuards(JwtAuthGuard)
@Controller('coinmarketcap')
export class CoinmarketcapController {
  constructor(private readonly coinmarketcapService: CoinmarketcapService) {}

  @Get('latest-global-metrics')
  @ApiOperation({ summary: 'Get the latest global metrics' })
  async getLatestGlobalMetrics() {
    return await this.coinmarketcapService.getLatestGlobalMetrics();
  }

  @Get('/info')
  @ApiOperation({ summary: 'Get crypto info' })
  async getCryptoInfo(@Query('ids') ids: string): Promise<any> {
    const idArray = ids ? ids.split(',') : [];
    return this.coinmarketcapService.getCryptoInfo(idArray);
  }

  @Get('listings-latest')
  @ApiOperation({ summary: 'Get the latest listings' })
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
  @ApiOperation({ summary: 'Get historical OHLCV data' })
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
