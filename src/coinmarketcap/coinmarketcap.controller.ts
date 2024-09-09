import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CoinmarketcapService } from './coinmarketcap.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { ClerkAuthGuard } from 'src/auth/guards/clerk-auth.guard';

// @ApiBearerAuth()
@ApiTags('CM Endpoints')
// @UseGuards(ClerkAuthGuard)
@Controller('cm')
export class CoinmarketcapController {
  constructor(private readonly coinmarketcapService: CoinmarketcapService) {}

  @Get('latest-global-metrics')
  @ApiOperation({ summary: 'Get the latest global metrics' })
  async getLatestGlobalMetrics() {
    return await this.coinmarketcapService.getLatestGlobalMetrics();
  }

  @Get('quotes-latest')
  @ApiOperation({ summary: 'Get the latest quote from an id' })
  async getLatestQuote(@Query('id') id: string) {
    return await this.coinmarketcapService.getLatestQuote(id);
  }

  // I need to add symbol to the query params. Example: "BTC,ETH"
  // The params are now rquired
  @Get('/info')
  @ApiOperation({ summary: 'Get crypto info' })
  async getCryptoInfo(@Query('id') id: string): Promise<any> {
    const idArray = id ? id.split(',') : [];
    return this.coinmarketcapService.getCryptoInfo(idArray);
  }

  @Get('listings-latest')
  @ApiOperation({ summary: 'Get the latest listings' })
  async getLatestListings(
    @Query('start') start: number,
    @Query('limit') limit: number,
    @Query('sort') sort: string
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

  @Get('/info-alert')
  @ApiOperation({ summary: 'Get crypto info' })
  @ApiQuery({
    name: 'id',
    type: String,
    required: false,
    description: 'Comma-separated cryptocurrency IDs (e.g., "1,1027")',
  })
  @ApiQuery({
    name: 'symbol',
    type: String,
    required: false,
    description: 'Comma-separated cryptocurrency symbols (e.g., "BTC,ETH")',
  })
  async getCryptoInfoAlert(
    @Query('id') id?: string,
    @Query('symbol') symbol?: string
  ): Promise<any> {
    if (!id && !symbol) {
      throw new HttpException(
        'At least one of id or symbol must be provided.',
        HttpStatus.BAD_REQUEST
      );
    }

    const idArray = id ? id.split(',') : [];
    const symbolArray = symbol ? symbol.split(',') : [];

    const result = await this.coinmarketcapService.getCryptoInfoAlert(
      idArray,
      symbolArray
    );

    return {
      data: result.data,
      failedSymbols: result.failedSymbols,
      message:
        result.failedSymbols.length > 0
          ? `Some symbols failed to fetch: ${result.failedSymbols.join(',')}`
          : 'All symbols fetched successfully',
    };
  }

  @Get('crypto-map')
  @ApiOperation({ summary: 'Get crypto map' })
  async getCryptoMap(@Query('symbol') symbol: string) {
    return await this.coinmarketcapService.getCryptoMap(symbol);
  }

  @Get('ohlcvHistorical')
  @ApiOperation({ summary: 'Get historical OHLCV data' })
  async getOhlcvHistorical(
    @Query('id') id: string,
    @Query('time_period') time_period?: string,
    @Query('time_start') time_start?: string,
    @Query('count') count?: number,
    @Query('interval') interval?: string
    // @Query('symbol') symbol: string,
    // @Query('time_end') time_end: string,
  ) {
    // console.log(
    //   'getOhlcvHistorical',
    //   id,
    //   time_period,
    //   time_start,
    //   count,
    //   interval
    // );
    return await this.coinmarketcapService.getOhlcvHistorical({
      id,
      time_period,
      time_start,
      count,
      interval,
    });
  }
}
